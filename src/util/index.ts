// Regex stolen from: https://stackoverflow.com/a/35002237
export const BASE64_REGEX =
  /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

export const HEX_REGEX = /^(0x)?(([a-f]|[0-9]){2})+$/i;

export const isValidBase64String = (str: string): boolean => {
  if (typeof str !== "string")
    throw new Error("Can only evaluate string values!");
  return BASE64_REGEX.test(str);
};

export const isValidHexString = (str: string): boolean => {
  if (typeof str !== "string")
    throw new Error("Can only evaluate string values!");
  return HEX_REGEX.test(str);
};
