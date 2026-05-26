declare module "lucide-react/dist/cjs/lucide-react.js" {
  import type {
    ForwardRefExoticComponent,
    RefAttributes,
    SVGProps,
  } from "react";

  type LucideIconProps = Omit<SVGProps<SVGSVGElement>, "ref"> & {
    absoluteStrokeWidth?: boolean;
    size?: number | string;
  } & RefAttributes<SVGSVGElement>;

  export const ChevronDown: ForwardRefExoticComponent<LucideIconProps>;
  export const ChevronLeft: ForwardRefExoticComponent<LucideIconProps>;
  export const ChevronRight: ForwardRefExoticComponent<LucideIconProps>;
}
