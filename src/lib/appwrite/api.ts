import { ID, Query } from "appwrite";

import { account, appwriteConfig, avatars, databases, storage } from "./config";
import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";

// AUTH

export async function createUserAccount(user: INewUser) {
    try {

        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        );

        if (!newAccount) throw new Error;

        const avatarUrl = avatars.getInitials(user.name);

        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            email: newAccount.email,
            name: newAccount.name,
            imageUrl: avatarUrl,
            username: user.username
        })

        return newUser;

    } catch (error) {
        
        console.log(error);
        return error;
    }
}

export async function saveUserToDB(user: {
    accountId: string,
    email: string,
    name: string,
    imageUrl: URL,   
    username?: string,
}) {
    // save user to db
    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user,
        )

        return newUser;

    } catch (error) {
        console.log(error);
    }
}

export async function signInAccount(user: { email: string; password: string }) {
    try {
      const session = await account.createEmailSession(user.email, user.password);
  
      return session;
    } catch (error) {
      console.log(error);
    }
}

export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();
        

        if(!currentAccount) throw new Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]

        )

        if (!currentUser) throw new Error;
        return currentUser.documents[0];
        
    } catch (error) {
        console.log(error);
    }
}

export async function signOutAccount() {
    try {
      const session = await account.deleteSession('current');

      return session;
    } catch (error) {
        console.log(error);
    }
}

// POST

export async function createPost(post: INewPost) {

    try {
        // upload image to stoarge
        const uploadedFile = await uploadFile(post.file[0]);

        if (!uploadedFile) throw Error;

        // get the url
        const fileUrl = getFilePreview(uploadedFile.$id);

        if(!fileUrl) {
            deleteFile(uploadedFile.$id);
            throw Error;
        }

        // convert tage to an array
        const tags = post.tags?.replace(/ /g, "").split(",") || [];

        // save post to database

        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            ID.unique(),
            {
                creator: post.userId,
                caption: post.caption,
                imageUrl: fileUrl,
                imageId: uploadedFile.$id,
                location: post.location,
                tags: tags,
            }
        )

        if(!newPost) {
            await deleteFile(uploadedFile.$id);
            throw new Error;
        }

        return newPost;

    } catch (error) {
        console.log(error);
    }
}

export async function uploadFile(file: File) {

    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file
        );

        return uploadedFile;

    } catch (error) {
        console.log(error);
    }
}

export function getFilePreview(fileId: string) {
    
    try {
        const fileUrl = storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000,
            2000,
            'top',
            100,
        );

        if (!fileUrl) throw Error;

        return fileUrl;
    } catch (error) {
        console.log(error);
    }
}

export async function deleteFile(fileId: string) {
    
    try {
        await storage.deleteFile(appwriteConfig.storageId, fileId);
        return { status: 'ok'}

        
    } catch (error) {
        console.log(error);
    }
}

export async function getRecentPosts() {
    const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [Query.orderDesc('$createdAt') , Query.limit(20)]
    )

    if (!posts) throw Error;
    return posts;
}

// POST ACTIONS

export async function likePost(postId: string, likesArray: string[]) {
    
    try {
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
            {
                likes: likesArray
            }
        )
        
        if(!updatedPost) throw Error;
        return updatedPost;

    } catch (error) {
        console.log(error);
    }
}

export async function savePost(postId: string, userId: string) {
    
    try {
        const updatedPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            ID.unique(),
            {
                post: postId,
                user: userId
            }
        )
        
        if(!updatedPost) throw Error;
        return updatedPost;

    } catch (error) {
        console.log(error);
    }
}

export async function deleteSavedPost(savedRecordId: string) {
    
    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            savedRecordId,
        )
        
        if(!statusCode) throw Error;
        return { status: 'ok'};

    } catch (error) {
        console.log(error);
    }
}



export async function getPostById(postId: string) {
    try {
        const post = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        )

        return post;

    } catch (error) {
        console.log(error);
    }
}

export async function updatePost(post: IUpdatePost) {

    const hasFileToUpdate = post.file.length > 0;

    try {

        let image = {
            imageUrl: post.imageUrl,
            imageId: post.imageId
        }

        if(hasFileToUpdate) {
            // upload image to stoarge
            const uploadedFile = await uploadFile(post.file[0]);

            if (!uploadedFile) throw Error;

            // get the url
            const fileUrl = getFilePreview(uploadedFile.$id);

            if(!fileUrl) {
                deleteFile(uploadedFile.$id);
                throw Error;
            }

            image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id }
        }

        // convert tage to an array
        const tags = post.tags?.replace(/ /g, "").split(",") || [];

        // save post to database

        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            post.postId,
            {
                caption: post.caption,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
                location: post.location,
                tags: tags,
            }
        )

        if(!updatedPost) {
            await deleteFile(post.imageId);
            throw new Error;
        }

        return updatedPost;

    } catch (error) {
        console.log(error);
    }
}

export async function deletePost(postId: string, imageId: string) {

    if (!postId || !imageId) throw new Error

    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        )

        return { status: 'ok' }

    } catch (error) {
        console.log(error);
    }
}

// EXPLORE

export async function getInfinitePosts({ pageParam }: { pageParam?: string }) {
    const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(6)];
  
    if (pageParam) {
      queries.push(Query.cursorAfter(pageParam.toString()));
    }
  
    try {
      const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        queries
      );
  
      if (!posts) throw Error;
  
      return posts;
    } catch (error) {
      console.log(error);
    }
  }


export async function searchPosts(searchTerm: string) {
    
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.search('caption', searchTerm)]
        )

        if (!posts) throw Error;
        return posts;
    } catch (error) {
        console.log(error);
    }
}

// USERS

export async function getUsers(limit?: number) {
    const queries: any[] = [Query.orderDesc("$createdAt")];
  
    if (limit) {
      queries.push(Query.limit(limit));
    }
  
    try {
      const users = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        queries
      );
  
      if (!users) throw Error;
  
      return users;
    } catch (error) {
      console.log(error);
    }
}

export async function getUserById(userId: string) {
    try {
      const user = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId
      );
  
      if (!user) throw Error;
  
      return user;
    } catch (error) {
      console.log(error);
    }
}

export async function updateUser(user: IUpdateUser) {
    const hasFileToUpdate = user.file.length > 0;
    try {
      let image = {
        imageUrl: user.imageUrl,
        imageId: user.imageId,
      };
  
      if (hasFileToUpdate) {
        // Upload new file to appwrite storage
        const uploadedFile = await uploadFile(user.file[0]);
        if (!uploadedFile) throw Error;
  
        // Get new file url
        const fileUrl = getFilePreview(uploadedFile.$id);
        if (!fileUrl) {
          await deleteFile(uploadedFile.$id);
          throw Error;
        }
  
        image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
      }
  
      //  Update user
      const updatedUser = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        user.userId,
        {
          name: user.name,
          bio: user.bio,
          imageUrl: image.imageUrl,
          imageId: image.imageId,
        }
      );
  
      // Failed to update
      if (!updatedUser) {
        // Delete new file that has been recently uploaded
        if (hasFileToUpdate) {
          await deleteFile(image.imageId);
        }
        // If no new file uploaded, just throw error
        throw Error;
      }
  
      // Safely delete old file after successful update
      if (user.imageId && hasFileToUpdate) {
        await deleteFile(user.imageId);
      }
  
      return updatedUser;
    } catch (error) {
      console.log(error);
    }
}

// FOLLOWING FUNCTIONALITY

export async function followUser(followerId: string, followingId: string) {
    try {
        const newFollow = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.followsCollectionId,
            ID.unique(),
            {
                followerId,
                followingId,
                createdAt: new Date().toISOString(),
            }
        );
        return newFollow;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to follow user");
    }
}

export async function unfollowUser(followerId: string, followingId: string) {
    try {
        // This assumes you've set up querying capabilities to find a specific follow relationship
        const followDocument = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.followsCollectionId,
            [
                Query.equal('followerId', followerId),
                Query.equal('followingId', followingId)
            ]
        );
        if (followDocument.documents.length === 0) throw new Error("Follow relationship not found");
        const documentId = followDocument.documents[0].$id;
        await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.followsCollectionId, documentId);
        return { status: 'ok', message: 'Unfollowed successfully' };
    } catch (error) {
        console.log(error);
        throw new Error("Failed to unfollow user");
    }
}

