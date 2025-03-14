import {CallableContext} from "firebase-functions/v1/https";
import {RequestData} from "../types";
import {PrismaClient} from "@prisma/client";
import {DataEncrypter} from "../dataEncryption";


/**
 * This function manages the groups for the user.
 * It can get all groups, create a new group, update a group, delete a group, add a member to a group, or remove a member from a group.
 * @param {RequestData} requestData - The data needed to manage the groups
 * @param {CallableContext} context - The context of the request
 * @param {PrismaClient} prisma - The prisma client used to interact with the database
 * @param {DataEncrypter} dataEncrypter - The data encrypter used to encrypt the data
 * @return {Promise<Object>} - The group data
 * @throws {Error} - If action is not supported or more data is needed to perform this operation
 */
export async function main(requestData : RequestData, context : CallableContext, prisma : PrismaClient, dataEncrypter : DataEncrypter) {
  // Get all groups for the user
  if (requestData.specificAction == "getGroups") {
    const groups = await prisma.contactGroups.findMany({
      where: {
        user_uid: context.auth!.uid,
      },
      include: {
        contactGroupMembers: {

        },
      }
    });


    const jsonData = {};

    groups.forEach(function(group) {
      const groupMembers = [] as any;
      group.contactGroupMembers.forEach(function(link) {
        groupMembers.push(link.contact_id);
      });

      jsonData[group.id] =
      {
        groupId: group.id,
        groupName: dataEncrypter.decryptData(group.name),
        groupDesc: dataEncrypter.decryptData(group.description),
        groupMembers: groupMembers
      };
    });

    return jsonData;
  } else if (requestData.specificAction == "createGroup") {
    const newGroup = await prisma.contactGroups.create({
      data: {
        name: dataEncrypter.encryptData(requestData.name),
        description: dataEncrypter.encryptData(requestData.description),
        user_uid: context.auth!.uid,
      },
    });
    return newGroup;
  } else if (requestData.specificAction == "updateGroup") {
    if (!requestData.group_id || !requestData.name || !requestData.description) {
      throw new Error("More data needed to perform this operation!");
    }

    const attributesToUpdate = {name: dataEncrypter.encryptData(requestData.name), description: dataEncrypter.encryptData(requestData.description)};
    const updatedGroup = await prisma.contactGroups.updateMany({
      where: {
        user_uid: context.auth!.uid,
        id: requestData.group_id,
      },
      data: attributesToUpdate,
    });

    return updatedGroup;
  } else if (requestData.specificAction == "deleteGroup") {
    if (requestData.group_id == undefined) {
      throw new Error("More data needed to perform this operation!");
    }

    // First remove all links to this group
    const deletedGroupMemberLinks = await prisma.contactGroupMembers.deleteMany({
      where: {
        user_uid: context.auth!.uid,
        group_id: {
          in: requestData.group_id,
        },
      },
    });

    // Then remove the group itself
    const deletedGroup = await prisma.contactGroups.deleteMany({
      where: {
        user_uid: context.auth!.uid,
        id: {
          in: requestData.group_id,
        },
      },
    });

    return {"Deleted group links:": deletedGroupMemberLinks, "Deleted groups": deletedGroup};
  } else if (requestData.specificAction == "removeMemberFromGroup") {
    const deletedGroupMember = await prisma.contactGroupMembers.deleteMany({
      where: {
        user_uid: context.auth!.uid,
        group_id: requestData.group_id,
        contact_id: requestData.member_id,
      },
    });

    return deletedGroupMember;
  } else if (requestData.specificAction == "addMemberToGroup") {
    const newGroupMember = await prisma.contactGroupMembers.create({
      data: {
        user_uid: context.auth!.uid,
        group_id: requestData.group_id,
        contact_id: requestData.member_id,
      },
    });
    return newGroupMember;
  } else {
    throw new Error("Action not supported!");
  }
}
