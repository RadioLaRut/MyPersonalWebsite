import Typography from "@/components/common/Typography";
import { motionClassNames } from "@/lib/motion/classes";
import { PUBLIC_COPY } from "@/lib/public-copy";
import NavigationTrigger from "./NavigationTrigger";

export default function Navigation({
  testingMode,
}: {
  testingMode: boolean;
}) {
  return (
    <NavigationTrigger
      testingMode={testingMode}
      triggerLabel={PUBLIC_COPY.navigation.triggerLabel}
    >
      <span aria-hidden="true" className="absolute -inset-3 md:-inset-4" />
      <Typography
        as="span"
        preset="sans-body"
        size="body-sm"
        weight="semantic"
        wrapPolicy="label"
        className={`relative z-10 text-white/80 ${motionClassNames.fastColors} group-hover:text-white`}
      >
        {PUBLIC_COPY.navigation.trigger}
      </Typography>
      <span className="relative z-10 grid justify-items-end gap-[7px] drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
        <span className={`h-[1.5px] w-10 bg-white/90 ${motionClassNames.fastAll} group-hover:w-14 group-hover:bg-white md:w-12`} />
        <span className={`h-[1.5px] w-6 bg-white/90 ${motionClassNames.fastAll} group-hover:w-14 group-hover:bg-white md:w-8`} />
      </span>
    </NavigationTrigger>
  );
}
