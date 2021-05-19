# Flameless - a serverless multisite CMS (firebase)
#### Video Demo: https://youtu.be/XVE7lS2mTj4
#### Description:
[Flameless](https://flameless.web.app) is a serverless CMS using Google [Firebase](https://firebase.google.com/) with a static frontend with [NuxtJS](https://nuxtjs.org/).

I took the idea of content management and [permissions from wordpress](https://wordpress.org/support/article/roles-and-capabilities/). The project allows the user to create one or more sites, within each site he can add, update and remove different types of content, he can also add registered users as members to his site and designate a predefined role (reader, editor, admin) or a custom one. Each user can create and / or belong to one or more sites and can have a different role in each site.

Roles have capabilities. The predefined ones (read, edit, edit_others, delete, delete_others) and others that can be added. The goal is to grant or deny access to content using only the [native rules of the firestore](https://firebase.google.com/docs/firestore/security/rules-structure) without using code on the server.

The content has an author field, so it can only be edited by those who have the necessary permissions: the author himself, an 'editor' or the 'admin'. And it can only be read by members of the site who have the permissions, like all of the previous ones plus subscribers and readers, for example.

With this project I had the intention of walking through many areas.
Starting with continuous integration and delivery (CI/CD), serverless computing and NoSQL databases.
Of the many platforms, I would choose Amazon Web Services, but for this project I liked the relative simplicity of google firebase. Since it easily integrates almost all solutions (authentication, realtime database, cloud functions and hosting)

## [.github/workflows/](.github/workflows/)
Any change made in the repository publishes the changes in the firebase

| File | purpose |
| ---- | ------- |
| [.github/workflows/firebase-firestore.yml](.github/workflows/firebase-firestore.yml) | Deploy database updates made to rules (`firestore.rules`) and indexes (`firestore.indexes.json`) |
| [.github/workflows/firebase-functions.yml](.github/workflows/firebase-functions.yml) | Deploy updates made to cloud functions (`functions/index.js`)
| [.github/workflows/firebase-hosting.yml](.github/workflows/firebase-hosting.yml) | Deploy static content (`public/dist`) to Firebase Hosting |

## Environment Variable
It is necessary to define a [FIREBASE_TOKEN](https://firebase.google.com/docs/cli#cli-ci-systems) secret key to publish the changes.

##  database schema
### /sites/**{siteId}** 
Site information, such as the title. And root of everything related to the site. In this way, by deleting the collection recursively, there will be no orphan data in other parts of the database.
```js
{ 
    title: String
}
```

### /sites/**{siteId}**/content/**{contentType}**
Definition of content types, such as pages and posts. Including the title, permissions and icon.

```js
{
    title: String, 
    icon: String,
    roles: {
        [role1]: {  // admin, editor, subscribers
            capabilities: {
                delete: Boolean,            // delete his own content.
                delete_others: Boolean,     // delete content of others.
                edit: Boolean,              // create or edit own content.
                edit_others: Boolean,       // create or edit content of others.
                manage_categories: Boolean, 
                read: Boolean                 
            }
        },
        [role2]: {
            ...
        }
    }    
}
```

### /sites/**{siteId}**/content/**{contentType}**/items/**{itemId}**
The content itself, the mandatory fields (used in the database rules) are:
```js
{
    createdAt: Timestamp,
    updatedAt: Timestamp,
    author: Path // == /users/{userId} (only existing users in /sites/{siteId}/members/{userId})
}
```

### /sites/**{siteId}**/content/**{contentType}**/items/**{itemId}**/comments/**{commentId}**
(to be implemented)

### /sites/**{siteId}**/content/**{contentType}**/categories/**{categoryId}**
(to be implemented)


### /sites/**{siteId}**/members/**{userId}**
The members of the site. They need to be a valid user and have a record in the 'users' collection.
```js
{
    role: String, // admin, editor, subscriber
    site_owner: Boolean, // the owner of the site has all capabilities.
    siteRef: Path, // == /sites/{siteId} ( used to query all sites to which the user is a member )
    userRef: Path, // == /users/{userId}
}
```

### /users/{userId}
General record of users, should be a mirror of firebase authentication.
```js
{
    email: String,
    displayName: String 
}
```

## [functions/](functions/)
I tried to use the least amount of code on the server side. basically using only 3 functions: one to ensure the creation of a data base record when a user registers (`onCreateSiteUser`). Other to create example content when creating a site (`onCreateSite`), and the last to implement [recursive deletion when a document is removed](https://cloud.google.com/firestore/docs/manage-data/delete-data#collections) (`onDeleteDocument`). Obviously, for a more complex application, more code will be needed, but the objective is to rely as much as possible on the rules of the database, forcing the user to make transactions that maintain the consistency of the information. Aiming at the case the application needs to grow at scale.

## [public/](public/)
This folder contains the code to generate a static frontend. I chose to use NuxtJS, because I fell in love with VueJS, and the ease of creating routes, pages, middlewares, stores, etc. The frontent uses the [firebase sdk js](https://firebase.google.com/docs/reference/js). In addition to the libraries required for the interface like [vuetify](http://vuetifyjs.com/) I used very few additional ones like [vuefire](https://vuefire.vuejs.org/vuefire/) (I [created a mixin](public/plugins/firebase.js) to make it easier to use, so that queries to the database behave like computed properties and react to changes to dependent properties, such as the 'router') I tried to keep it minimalist.