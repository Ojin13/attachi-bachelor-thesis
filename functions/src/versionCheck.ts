import {PrismaClient} from "@prisma/client";


/**
 * This function checks the version of the app to determine if the user needs to update the app.
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @return {Promise<Object>} - The version data
 */
export async function main(prisma : PrismaClient) {
  const MINIMAL_SUPPORTED_VERSION = 13;
  const LATEST_VERSION = 13;

  // If installed version is lower than minimal supported version, redirect to update page
  const updateNews = await prisma.updateNews.findMany({
    where: {
      build_number: LATEST_VERSION.toString(),
    },
  });

  const jsonData = {
    minimalSupportedVersion: MINIMAL_SUPPORTED_VERSION,
    lastVersionSummary: updateNews[0].update_summary,
    lastVersionDescription: updateNews[0].update_description,
    lastVersionCode: updateNews[0].version_code
  };

  return jsonData;
}
