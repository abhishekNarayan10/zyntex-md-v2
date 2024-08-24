declare function validateID(id: string): boolean;
declare function getURLVideoID(link: string): string;
declare function getVideoID(str: string): string;
/** Checks wether the input string includes a valid id. */
declare function validateURL(str: string): boolean;
export { validateID, validateURL, getURLVideoID, getVideoID };
declare const _default: {
    validateID: typeof validateID;
    validateURL: typeof validateURL;
    getURLVideoID: typeof getURLVideoID;
    getVideoID: typeof getVideoID;
};
export default _default;
