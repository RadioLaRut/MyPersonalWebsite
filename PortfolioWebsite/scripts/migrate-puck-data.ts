import fs from "fs";
import path from "path";
import { type Data } from "@measured/puck";

/**
 * Migration specific updates
 * - Merge LightingProjectCard -> WorksListEntry
 * - Merge LightingCollectionItem -> ImagePanel
 * - Merge ContactExperienceItem -> MetadataListItem
 * - Merge ContactDirectionItem -> MetadataListItem
 */

function migratePuckData(data: Data): Data {
    let hasChanges = false;
    const newData = JSON.parse(JSON.stringify(data)) as Data; // Deep copy

    const migrateItem = (item: any) => {
        // 1. LightingProjectCard -> WorksListEntry
        if (item.type === "LightingProjectCard") {
            item.type = "WorksListEntry";
            if (item.props.coverImage) {
                item.props.imageSrc = item.props.coverImage;
                delete item.props.coverImage;
            }
            hasChanges = true;
        }

        // 2. LightingCollectionItem -> ImagePanel
        if (item.type === "LightingCollectionItem") {
            item.type = "ImagePanel";
            // src and caption are already matching
            // Default out to fullscreen variant which is typical for this portfolio
            item.props.variant = "fullscreen";
            hasChanges = true;
        }

        // 3. ContactExperienceItem -> MetadataListItem
        if (item.type === "ContactExperienceItem") {
            item.type = "MetadataListItem";
            if (item.props.company) {
                item.props.label = item.props.company;
                delete item.props.company;
            }
            if (item.props.role) {
                item.props.value = item.props.role;
                delete item.props.role;
            }
            hasChanges = true;
        }

        // 4. ContactDirectionItem -> MetadataListItem
        if (item.type === "ContactDirectionItem") {
            item.type = "MetadataListItem";
            if (item.props.title) {
                item.props.label = item.props.title;
                delete item.props.title;
            }
            if (item.props.subtitle) {
                item.props.value = item.props.subtitle;
                delete item.props.subtitle;
            }
            hasChanges = true;
        }
    };

    // Migrate main content
    newData.content.forEach((item) => {
        migrateItem(item);
    });

    // Migrate zones
    if (newData.zones) {
        Object.keys(newData.zones).forEach((zoneKey) => {
            newData.zones![zoneKey].forEach((item) => {
                migrateItem(item);
            });
        });
    }

    return hasChanges ? newData : data;
}

const contentDir = path.join(process.cwd(), "content", "pages");

function processDirectory(directory: string) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (stat.isFile() && file.endsWith(".json")) {
            try {
                const rawData = fs.readFileSync(fullPath, "utf-8");
                const data = JSON.parse(rawData) as Data;

                const newData = migratePuckData(data);

                if (newData !== data) {
                    console.log(`Migrated: ${fullPath}`);
                    fs.writeFileSync(fullPath, JSON.stringify(newData, null, 2), "utf-8");
                }
            } catch (e) {
                console.error(`Error processing ${fullPath}:`, e);
            }
        }
    }
}

console.log("Starting data migration...");
processDirectory(contentDir);
console.log("Migration complete.");
