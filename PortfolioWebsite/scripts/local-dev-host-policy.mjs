const HOSTNAME_FLAGS = new Set(["-H", "--hostname"]);

function isHostnameArgument(argument) {
  return (
    HOSTNAME_FLAGS.has(argument) ||
    argument.startsWith("-H=") ||
    argument.startsWith("--hostname=") ||
    /^-H.+$/u.test(argument)
  );
}

export function buildNextArguments(siteMode, nextArguments) {
  if (!Array.isArray(nextArguments) || nextArguments.length === 0) {
    throw new TypeError("Next.js arguments must include a command");
  }

  if (siteMode !== "testing" || nextArguments[0] !== "dev") {
    return [...nextArguments];
  }

  const hostnameArguments = nextArguments.filter(isHostnameArgument);
  if (hostnameArguments.length > 0) {
    throw new Error(
      "testing dev owns the listener address; do not pass -H or --hostname",
    );
  }

  return [...nextArguments, "--hostname", "127.0.0.1"];
}
