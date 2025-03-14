import type { LinkType } from "~/types";

/**
 * Function that resolves the link object to a valid URL
 * If link object has a known type, it will be formatted accordingly
 * so user can enter for example only reddit username and it will be resolved to full URL.
 *
 * @param linkObject - The link object to resolve
 * @returns The resolved URL
 */
export default function resolveLink(linkObject: LinkType): string {
    let formattedLink = "";

    if (linkObject.url.startsWith("http")) {
        return linkObject.url;
    }

    if (linkObject.url.startsWith("www.")) {
        return "https://" + linkObject.url;
    }

    // Remove all / from the beginning of the url
    while (linkObject.url.startsWith("/")) {
        linkObject.url = linkObject.url.slice(1);
    }

    if (!linkObject.type) {
        return "https://www." + linkObject.url;
    } else if (linkObject.type == "facebook") {
        formattedLink = "https://www.facebook.com/" + linkObject.url;
    } else if (linkObject.type == "instagram") {
        formattedLink = "https://www.instagram.com/" + linkObject.url;
    } else if (linkObject.type == "linkedin") {
        formattedLink = "https://www.linkedin.com/in/" + linkObject.url;
    } else if (linkObject.type == "reddit") {
        formattedLink = "https://www.reddit.com/user/" + linkObject.url;
    } else if (linkObject.type == "twitter") {
        formattedLink = "https://www.twitter.com/" + linkObject.url;
    } else if (linkObject.type == "wikipedia") {
        formattedLink = "https://www.wikipedia.org/wiki/" + linkObject.url;
    } else if (linkObject.type == "youtube") {
        formattedLink = "https://www.youtube.com/user/" + linkObject.url;
    } else {
        // If the type is not recognized, just add protocol
        formattedLink = "https://www." + linkObject.url;
    }

    return formattedLink;
}
