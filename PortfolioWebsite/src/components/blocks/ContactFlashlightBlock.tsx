import React, {
  type ComponentPropsWithRef,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from "react";

import ComponentLayoutNode, {
  getComponentLayoutAlignment,
  getComponentLayoutNode,
  getComponentLayoutTypography,
  type ComponentLayoutProps,
} from "@/components/common/ComponentLayoutNode";
import Typography, {
  type TypographyAlignment,
} from "@/components/common/Typography";
import {
  type ComponentDesignOverride,
  resolveComponentDesign,
} from "@/lib/component-design-runtime";
import {
  getComponentLayoutGap,
  getComponentLayoutNodeClassName,
  getComponentLayoutNodeStyle,
  getComponentSectionProfileClassName,
  getComponentSectionStyle,
  getGridColumnClassName,
  getResponsiveGapStyle,
} from "@/lib/component-design-style";
import { hasEditableTextContent, toPlainText } from "@/lib/editable-text";
import { PUBLIC_COPY } from "@/lib/public-copy";

import ContactFlashlightIsland from "./ContactFlashlightIsland";

export interface ContactFlashlightBlockProps
  extends ComponentDesignOverride<"ContactFlashlight">, ComponentLayoutProps {
  anchorId?: string;
  maskRadius?: number;
  maskSmoothness?: number;
  darkTextColor?: string;
  lightTextColor?: string;
  name?: ReactNode;
  taglineText?: ReactNode;
  taglineSub?: ReactNode;
  taglineSubAlign?: TypographyAlignment;
  email?: ReactNode;
  wechat?: ReactNode;
  copyLabel?: ReactNode;
  copySuccessMessage?: string;
  copyErrorMessage?: string;
  clientsHeading?: ReactNode;
  employmentHeading?: ReactNode;
  contactHeading?: ReactNode;
  emailHeading?: ReactNode;
  experienceHistory?: { company: ReactNode; role: ReactNode }[];
  creativeDirection?: { title: ReactNode; subtitle: ReactNode }[];
  experienceContent?: ReactNode;
  creativeContent?: ReactNode;
  editMode?: boolean;
}

type SlotElementProps = {
  allow?: readonly string[];
  as?: ElementType;
  className?: string;
  componentLabAnnotations?: true;
  minEmptyHeight?: CSSProperties["minHeight"] | number;
  style?: CSSProperties;
};

type RepeatedSlotStyle = CSSProperties & {
  "--component-gap-desktop"?: string;
  "--component-gap-mobile"?: string;
  "--component-gap-tablet"?: string;
  "--component-repeated-gap-desktop"?: string;
  "--component-repeated-gap-mobile"?: string;
  "--component-repeated-gap-tablet"?: string;
};

function isPuckSlotElement(
  node: ReactNode,
): node is ReactElement<SlotElementProps> {
  if (!React.isValidElement(node) || typeof node.type === "string") {
    return false;
  }
  const props = node.props as SlotElementProps;
  return props.allow !== undefined || props.minEmptyHeight !== undefined;
}

function getRepeatedItemStyle(
  style: CSSProperties | undefined,
  occurrence: number,
): RepeatedSlotStyle | undefined {
  if (occurrence === 0) return style;
  const repeatedStyle = style as RepeatedSlotStyle | undefined;
  return {
    ...style,
    "--component-gap-desktop":
      repeatedStyle?.["--component-repeated-gap-desktop"] ?? "0px",
    "--component-gap-mobile":
      repeatedStyle?.["--component-repeated-gap-mobile"] ?? "0px",
    "--component-gap-tablet":
      repeatedStyle?.["--component-repeated-gap-tablet"] ?? "0px",
  };
}

function RepeatedSlotRoot({
  children,
  className,
  componentLabAnnotations,
  roleId,
  style,
  ...rootProps
}: ComponentPropsWithRef<"div"> & {
  componentLabAnnotations?: true;
  roleId: string;
}) {
  const items = React.Children.toArray(children);
  const isPuckEditor = Boolean(
    (rootProps as Record<string, unknown>)["data-puck-dropzone"],
  );
  return (
    <div
      {...rootProps}
      className={isPuckEditor ? className : "contents"}
      style={isPuckEditor ? style : undefined}
    >
      {items.map((child, occurrence) => (
        <div
          key={React.isValidElement(child) && child.key !== null
            ? child.key
            : occurrence}
          className={isPuckEditor ? undefined : className}
          {...(componentLabAnnotations
            ? {
              "data-component-lab-node": roleId,
              "data-component-lab-occurrence": occurrence,
            }
            : {})}
          style={isPuckEditor
            ? undefined
            : getRepeatedItemStyle(style, occurrence)}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

function ClientsSlotRoot(props: ComponentPropsWithRef<"div">) {
  return <RepeatedSlotRoot {...props} roleId="clients.item" />;
}

function EmploymentSlotRoot(props: ComponentPropsWithRef<"div">) {
  return <RepeatedSlotRoot {...props} roleId="employment.item" />;
}

function getRepeatedSlotLayoutProps(
  layout: NonNullable<ComponentLayoutProps["componentLayout"]>,
  nodeId: string,
  gapFrom: string,
) {
  const node = getComponentLayoutNode(layout, nodeId);
  const firstGapStyle = getResponsiveGapStyle(
    getComponentLayoutGap(layout, gapFrom, nodeId),
  );
  const repeatedGapStyle = getResponsiveGapStyle(
    getComponentLayoutGap(layout, nodeId, nodeId),
  );
  const nodeStyle = getComponentLayoutNodeStyle(node, layout.section);
  const hasGap = Boolean(firstGapStyle || repeatedGapStyle);
  const style: RepeatedSlotStyle = {
    ...firstGapStyle,
    ...nodeStyle,
    "--component-repeated-gap-desktop":
      repeatedGapStyle?.["--component-gap-desktop"] ?? "0px",
    "--component-repeated-gap-mobile":
      repeatedGapStyle?.["--component-gap-mobile"] ?? "0px",
    "--component-repeated-gap-tablet":
      repeatedGapStyle?.["--component-gap-tablet"] ?? "0px",
  };
  return {
    className: [
      getComponentLayoutNodeClassName(node),
      hasGap ? "component-layout-node-gap" : "",
    ].filter(Boolean).join(" "),
    style,
  };
}

export default function ContactFlashlightBlock({
  anchorId = "contact",
  maskRadius = 500,
  maskSmoothness = 40,
  darkTextColor = "rgba(255,255,255,0.4)",
  lightTextColor = "rgba(255,255,255,1)",
  name,
  taglineText,
  taglineSub,
  taglineSubAlign = "left",
  email,
  wechat,
  copyLabel = PUBLIC_COPY.contact.copyLabel,
  copySuccessMessage = PUBLIC_COPY.contact.copySuccessMessage,
  copyErrorMessage = PUBLIC_COPY.contact.copyErrorMessage,
  clientsHeading,
  employmentHeading,
  contactHeading,
  emailHeading,
  componentLayout,
  experienceHistory = [],
  creativeDirection = [],
  experienceContent,
  creativeContent,
  editMode = false,
  design: designOverride,
}: ContactFlashlightBlockProps) {
  const design = resolveComponentDesign("ContactFlashlight", designOverride);
  const emailText = toPlainText(email) ?? "";
  const wechatText = toPlainText(wechat) ?? "";
  const maskImage =
    `radial-gradient(${maskRadius}px circle at var(--flashlight-x, 50%) var(--flashlight-y, 50%), black 0%, black ${maskSmoothness}%, transparent 100%)`;
  const revealLayerStyle: CSSProperties = {
    color: lightTextColor,
    WebkitMaskImage: maskImage,
    maskImage,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };
  const experienceContentItems = React.Children.toArray(experienceContent);
  const creativeContentItems = React.Children.toArray(creativeContent);
  const typography = (nodeId: string) =>
    getComponentLayoutTypography(componentLayout, nodeId);
  const fallbackClassName = componentLayout
    ? undefined
    : getGridColumnClassName(design.heroBounds);

  const renderRepeatedItems = ({
    contentItems,
    fallbackItems,
    gapFrom,
    roleId,
    SlotRoot,
  }: {
    contentItems: ReactNode[];
    fallbackItems: ReactNode[];
    gapFrom: string;
    roleId: string;
    SlotRoot: ElementType;
  }) => {
    const items = contentItems.length > 0
      ? contentItems
      : React.Children.toArray(fallbackItems);
    const slotLayoutProps = componentLayout
      ? getRepeatedSlotLayoutProps(componentLayout, roleId, gapFrom)
      : undefined;
    return items.map((child, occurrence) => {
      if (isPuckSlotElement(child)) {
        return React.cloneElement(child, {
          as: SlotRoot,
          className: [
            child.props.className ?? "",
            slotLayoutProps?.className ?? "",
            componentLayout ? "" : "col-span-12",
          ].filter(Boolean).join(" "),
          componentLabAnnotations:
            componentLayout?.componentLabAnnotations,
          style: {
            ...child.props.style,
            ...slotLayoutProps?.style,
          },
        });
      }
      return (
        <ComponentLayoutNode
          key={React.isValidElement(child) && child.key !== null
            ? child.key
            : occurrence}
          className={!componentLayout ? "col-span-12" : undefined}
          gapFrom={occurrence === 0 ? gapFrom : roleId}
          layout={componentLayout}
          nodeId={roleId}
          occurrence={occurrence}
        >
          {child}
        </ComponentLayoutNode>
      );
    });
  };

  const renderContentData = (interactive = true) => (
    <div
      className={`grid-container w-full ${
        componentLayout
          ? getComponentSectionProfileClassName(componentLayout)
          : "rhythm-section-spacious"
      }`}
      style={getComponentSectionStyle(componentLayout)}
    >
      {hasEditableTextContent(name) ? (
        <ComponentLayoutNode
          className={fallbackClassName}
          layout={componentLayout}
          nodeId="name"
        >
          <Typography
            as="h1"
            preset={typography("name")?.preset ?? "luna-editorial"}
            size={typography("name")?.size ?? "hero"}
            weight="semantic"
            wrapPolicy={typography("name")?.wrap ?? "heading"}
            align={getComponentLayoutAlignment(componentLayout, "name")}
            className="text-inherit"
          >
            {name}
          </Typography>
        </ComponentLayoutNode>
      ) : null}
      {hasEditableTextContent(taglineText) ? (
        <ComponentLayoutNode
          className={fallbackClassName}
          gapFrom="name"
          layout={componentLayout}
          nodeId="tagline"
        >
          <Typography
            as="p"
            preset={typography("tagline")?.preset ?? "sans-body"}
            size={typography("tagline")?.size ?? "title-sm"}
            weight="semantic"
            wrapPolicy={typography("tagline")?.wrap ?? "heading"}
            align={getComponentLayoutAlignment(componentLayout, "tagline")}
            className="text-inherit"
          >
            {taglineText}
          </Typography>
        </ComponentLayoutNode>
      ) : null}
      {hasEditableTextContent(taglineSub) ? (
        <ComponentLayoutNode
          className={fallbackClassName}
          gapFrom={hasEditableTextContent(taglineText) ? "tagline" : "name"}
          layout={componentLayout}
          nodeId="taglineSub"
        >
          <Typography
            as="p"
            preset={typography("taglineSub")?.preset ?? "sans-body"}
            size={typography("taglineSub")?.size ?? "body"}
            weight="semantic"
            wrapPolicy={typography("taglineSub")?.wrap ?? "prose"}
            align={getComponentLayoutAlignment(
              componentLayout,
              "taglineSub",
              taglineSubAlign,
            )}
            className="opacity-50"
          >
            {taglineSub}
          </Typography>
        </ComponentLayoutNode>
      ) : null}

      {hasEditableTextContent(clientsHeading) ? (
        <ComponentLayoutNode
          className={!componentLayout ? "col-span-12" : undefined}
          layout={componentLayout}
          nodeId="clientsHeading"
        >
          <Typography
            as="h2"
            preset={typography("clientsHeading")?.preset ?? "sans-body"}
            size={typography("clientsHeading")?.size ?? "label"}
            weight="semantic"
            wrapPolicy={typography("clientsHeading")?.wrap ?? "label"}
            align={getComponentLayoutAlignment(
              componentLayout,
              "clientsHeading",
            )}
            className="opacity-40"
          >
            {clientsHeading}
          </Typography>
        </ComponentLayoutNode>
      ) : null}
      {experienceContentItems.length > 0 || experienceHistory.length > 0
        ? renderRepeatedItems({
          contentItems: experienceContentItems,
          fallbackItems: experienceHistory.map((item, index) => (
            <div key={index} className="grid gap-1">
              <Typography
                as="span"
                preset={typography("clients.item")?.preset ?? "sans-body"}
                size={typography("clients.item")?.size ?? "body-sm"}
                weight="strong"
                wrapPolicy={typography("clients.item")?.wrap ?? "prose"}
                align={getComponentLayoutAlignment(
                  componentLayout,
                  "clients.item",
                )}
                className="text-inherit"
              >
                {item.company}
              </Typography>
              <Typography
                as="span"
                preset={typography("clients.item")?.preset ?? "sans-body"}
                size={typography("clients.item")?.size ?? "body-sm"}
                weight="semantic"
                wrapPolicy={typography("clients.item")?.wrap ?? "prose"}
                align={getComponentLayoutAlignment(
                  componentLayout,
                  "clients.item",
                )}
                className="opacity-50"
              >
                {item.role}
              </Typography>
            </div>
          )),
          gapFrom: "clientsHeading",
          roleId: "clients.item",
          SlotRoot: ClientsSlotRoot,
        })
        : null}

      {hasEditableTextContent(employmentHeading) ? (
        <ComponentLayoutNode
          className={!componentLayout ? "col-span-12" : undefined}
          layout={componentLayout}
          nodeId="employmentHeading"
        >
          <Typography
            as="h2"
            preset={typography("employmentHeading")?.preset ?? "sans-body"}
            size={typography("employmentHeading")?.size ?? "label"}
            weight="semantic"
            wrapPolicy={typography("employmentHeading")?.wrap ?? "label"}
            align={getComponentLayoutAlignment(
              componentLayout,
              "employmentHeading",
            )}
            className="opacity-40"
          >
            {employmentHeading}
          </Typography>
        </ComponentLayoutNode>
      ) : null}
      {creativeContentItems.length > 0 || creativeDirection.length > 0
        ? renderRepeatedItems({
          contentItems: creativeContentItems,
          fallbackItems: creativeDirection.map((item, index) => (
            <div key={index} className="grid gap-1">
              <Typography
                as="span"
                preset={typography("employment.item")?.preset ?? "sans-body"}
                size={typography("employment.item")?.size ?? "body-sm"}
                weight="strong"
                wrapPolicy={typography("employment.item")?.wrap ?? "prose"}
                align={getComponentLayoutAlignment(
                  componentLayout,
                  "employment.item",
                )}
                className="text-inherit"
              >
                {item.title}
              </Typography>
              <Typography
                as="span"
                preset={typography("employment.item")?.preset ?? "sans-body"}
                size={typography("employment.item")?.size ?? "body-sm"}
                weight="semantic"
                wrapPolicy={typography("employment.item")?.wrap ?? "prose"}
                align={getComponentLayoutAlignment(
                  componentLayout,
                  "employment.item",
                )}
                className="opacity-50"
              >
                {item.subtitle}
              </Typography>
            </div>
          )),
          gapFrom: "employmentHeading",
          roleId: "employment.item",
          SlotRoot: EmploymentSlotRoot,
        })
        : null}

      {hasEditableTextContent(contactHeading) ? (
        <ComponentLayoutNode
          className={!componentLayout ? "col-span-12" : undefined}
          layout={componentLayout}
          nodeId="contactHeading"
        >
          <Typography
            preset={typography("contactHeading")?.preset ?? "sans-body"}
            size={typography("contactHeading")?.size ?? "label"}
            weight="semantic"
            wrapPolicy={typography("contactHeading")?.wrap ?? "label"}
            align={getComponentLayoutAlignment(
              componentLayout,
              "contactHeading",
            )}
            className="opacity-40"
          >
            {contactHeading}
          </Typography>
        </ComponentLayoutNode>
      ) : null}
      {wechatText ? (
        <ComponentLayoutNode
          className={!componentLayout ? "col-span-12" : undefined}
          gapFrom="contactHeading"
          layout={componentLayout}
          nodeId="wechat"
        >
          <button
            type="button"
            disabled={editMode || !interactive}
            data-contact-copy={!editMode && interactive ? "" : undefined}
            aria-label={`${PUBLIC_COPY.contact.copyLabel} ${wechatText}`}
            className="copyable-contact grid w-fit max-w-full text-left"
          >
            <Typography
              as="span"
              preset={typography("wechat")?.preset ?? "gothic-editorial"}
              size={typography("wechat")?.size ?? "body-lg"}
              weight="semantic"
              wrapPolicy={typography("wechat")?.wrap ?? "url"}
              align={getComponentLayoutAlignment(
                componentLayout,
                "wechat",
              )}
              className="break-all text-inherit"
            >
              {wechat}
            </Typography>
          </button>
        </ComponentLayoutNode>
      ) : null}
      {hasEditableTextContent(copyLabel) ? (
        <ComponentLayoutNode
          className={!componentLayout ? "col-span-12" : undefined}
          gapFrom="wechat"
          layout={componentLayout}
          nodeId="copyPrompt"
        >
          <Typography
            as="span"
            preset={typography("copyPrompt")?.preset ?? "sans-body"}
            size={typography("copyPrompt")?.size ?? "caption"}
            weight="semantic"
            wrapPolicy={typography("copyPrompt")?.wrap ?? "label"}
            align={getComponentLayoutAlignment(
              componentLayout,
              "copyPrompt",
            )}
            className="opacity-50"
          >
            <span
              data-contact-copy-feedback={!editMode && interactive
                ? ""
                : undefined}
            >
              {copyLabel}
            </span>
          </Typography>
        </ComponentLayoutNode>
      ) : null}
      <span
        className="sr-only"
        role="status"
        aria-live="polite"
        data-contact-copy-live={!editMode && interactive ? "" : undefined}
      />

      {hasEditableTextContent(emailHeading) ? (
        <ComponentLayoutNode
          className={!componentLayout ? "col-span-12" : undefined}
          layout={componentLayout}
          nodeId="emailHeading"
        >
          <Typography
            preset={typography("emailHeading")?.preset ?? "sans-body"}
            size={typography("emailHeading")?.size ?? "label"}
            weight="semantic"
            wrapPolicy={typography("emailHeading")?.wrap ?? "label"}
            align={getComponentLayoutAlignment(
              componentLayout,
              "emailHeading",
            )}
            className="opacity-40"
          >
            {emailHeading}
          </Typography>
        </ComponentLayoutNode>
      ) : null}
      {emailText ? (
        <ComponentLayoutNode
          alignmentTarget="box"
          className={!componentLayout ? "col-span-12" : undefined}
          gapFrom="emailHeading"
          layout={componentLayout}
          nodeId="email"
        >
          <a
            href={`mailto:${emailText}`}
            tabIndex={interactive ? undefined : -1}
            className="copyable-contact block w-fit max-w-full break-all"
          >
            <Typography
              as="span"
              preset={typography("email")?.preset ?? "gothic-editorial"}
              size={typography("email")?.size ?? "body-lg"}
              weight="semantic"
              wrapPolicy={typography("email")?.wrap ?? "url"}
              align="center"
              className="text-inherit"
            >
              {email}
            </Typography>
          </a>
        </ComponentLayoutNode>
      ) : null}
    </div>
  );

  return (
    <div
      id={anchorId || undefined}
      className="relative w-full scroll-mt-24 overflow-hidden selection:bg-white selection:text-black"
      data-contact-flashlight={editMode ? undefined : ""}
    >
      <div className="relative mx-auto w-full pb-16">
        {editMode ? (
          <div
            className="z-10 transition-colors duration-300"
            style={{ color: lightTextColor }}
          >
            {renderContentData()}
          </div>
        ) : (
          <>
            <div
              className="z-10 transition-colors duration-300"
              style={{ color: darkTextColor }}
            >
              {renderContentData()}
            </div>
            <div
              className="pointer-events-none absolute inset-0 z-20 drop-shadow-[0_0_15px_rgba(255,255,255,0.45)]"
              aria-hidden="true"
              style={revealLayerStyle}
              data-contact-reveal-layer=""
              data-mask-image={maskImage}
            >
              {renderContentData(false)}
            </div>
          </>
        )}
      </div>
      {!editMode ? (
        <ContactFlashlightIsland
          copyErrorMessage={copyErrorMessage}
          copyLabel={toPlainText(copyLabel) ?? PUBLIC_COPY.contact.copyLabel}
          copySuccessMessage={copySuccessMessage}
          maskRadius={maskRadius}
          wechat={wechatText}
        />
      ) : null}
    </div>
  );
}
