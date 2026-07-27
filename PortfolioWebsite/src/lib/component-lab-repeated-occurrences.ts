import type {
  ComponentDesignNodeDescriptor,
  ComponentDesignVariantDescriptor,
} from "./component-design-manifest.ts";

type SampleText = Record<string, string | string[]>;

function getSampleCount(
  node: ComponentDesignNodeDescriptor,
  sampleText: SampleText,
) {
  const value = sampleText[node.id];
  return Array.isArray(value) ? value.length : 0;
}

function getCollectionKey(
  node: ComponentDesignNodeDescriptor,
  collectionPath: string,
) {
  return `${node.group}\u0000${collectionPath}`;
}

export function getComponentLabRepeatedOccurrenceCounts({
  actualCounts,
  descriptor,
  sampleText,
}: {
  actualCounts: Readonly<Record<string, number>>;
  descriptor: ComponentDesignVariantDescriptor;
  sampleText: SampleText;
}): Record<string, number> {
  const repeatedNodes = descriptor.nodes.filter((node) => node.repeated);
  const collectionsByGroup = new Map<string, Set<string>>();
  const countByCollection = new Map<string, number>();
  const actualCountByGroup = new Map<string, number>();

  repeatedNodes.forEach((node) => {
    const actualCount = actualCounts[node.id] ?? 0;
    actualCountByGroup.set(
      node.group,
      Math.max(actualCountByGroup.get(node.group) ?? 0, actualCount),
    );
    if (node.sampleBinding?.kind !== "repeated") return;
    const collection = getCollectionKey(
      node,
      node.sampleBinding.collectionPath,
    );
    const groupCollections = collectionsByGroup.get(node.group) ??
      new Set<string>();
    groupCollections.add(collection);
    collectionsByGroup.set(node.group, groupCollections);
    countByCollection.set(
      collection,
      Math.max(
        countByCollection.get(collection) ?? 0,
        actualCount,
        getSampleCount(node, sampleText),
      ),
    );
  });

  collectionsByGroup.forEach((collections, group) => {
    if (collections.size !== 1) return;
    const collection = [...collections][0];
    countByCollection.set(
      collection,
      Math.max(
        countByCollection.get(collection) ?? 0,
        actualCountByGroup.get(group) ?? 0,
      ),
    );
  });

  return Object.fromEntries(repeatedNodes.map((node) => {
    const ownCount = Math.max(
      1,
      actualCounts[node.id] ?? 0,
      getSampleCount(node, sampleText),
    );
    if (node.sampleBinding?.kind === "repeated") {
      return [
        node.id,
        Math.max(
          ownCount,
          countByCollection.get(
            getCollectionKey(node, node.sampleBinding.collectionPath),
          ) ?? 0,
        ),
      ];
    }

    const groupCollections = collectionsByGroup.get(node.group);
    const sharedCollectionCount = groupCollections?.size === 1
      ? countByCollection.get([...groupCollections][0]) ?? 0
      : 0;
    return [
      node.id,
      Math.max(
        ownCount,
        actualCountByGroup.get(node.group) ?? 0,
        sharedCollectionCount,
      ),
    ];
  }));
}
