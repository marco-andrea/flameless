const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', {structuredData: true});
  response.send('Hello from Firebase!');
});

exports.sendWelcomeEmail = functions.auth.user().onCreate((user) => {
  return db.collection('users').doc(user.uid).set({}, {merge: true});
});

exports.onCreateSite = functions.firestore.document('sites/{site}').onCreate(async (snap, context) => {

  const defaultSchema = {
    capabilities: {
      admin: {
        delete: true,
        delete_others: true,
        edit: true,
        edit_others: true,
        manage_categories: true,
        read: true,
      },
      editor: {
        delete: false,
        delete_others: false,
        edit: true,
        edit_others: true,
        manage_categories: true,
        read: true,
      },
      subscriber: {
        read: true,
      },
    }
  };

  // Load some content
  const batch = db.batch();

  batch.set(snap.ref.collection('content').doc('posts'), { title: "Post", icon: 'mdi-pencil', ...defaultSchema});
  batch.set(snap.ref.collection('content').doc('pages'), { title: "Page", icon: 'mdi-view-dashboard', ...defaultSchema});  
  batch.set(snap.ref.collection('content/posts/categories').doc(), { title: "Post Category title" });
  batch.set(snap.ref.collection('content/pages/categories').doc(), { title: "Page Category title" });  
  batch.set(snap.ref.collection('content/posts/items').doc(), { title: "Post title" });
  batch.set(snap.ref.collection('content/pages/items').doc(), { title: "Page title" });
  
  await batch.commit();

})

exports.deleteCollection = functions.firestore.document('{document=**}').onDelete(async ({ref: documentRef}, context) => {

  const collections = await documentRef.listCollections();

  if (!collections.length) {
    return;
  }

  // https://cloud.google.com/firestore/docs/manage-data/delete-data#collections

  async function deleteCollection(collectionRef, batchSize) {   
    console.log(`deleteCollection ${collectionRef.path}`); 
    const query = collectionRef.orderBy('__name__').limit(batchSize);
  
    return new Promise((resolve, reject) => {
      deleteQueryBatch(query, resolve).catch(reject);
    });

  }
  
  async function deleteQueryBatch(query, resolve) {
    console.log("deleteQueryBatch");
    const snapshot = await query.get();
  
    const batchSize = snapshot.size;
    if (batchSize === 0) {
      // When there are no documents left, we are done
      resolve();
      return;
    }
  
    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {      
      console.log(`Deleting document: ${doc.ref.path}`);
      batch.delete(doc.ref);
    });
    await batch.commit();
  
    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
      deleteQueryBatch(query, resolve);
    });

  }

  return Promise.all( collections.map((collection) => deleteCollection(collection, 500)) );

});

















  /*


  
exports.processPending = functions.firestore.document('pending/{document}').onWrite(async (change, context) => {

  if (!change.after.exists) {
    return;
  }

  let { path } = change.after.data();

  const query = db.collection(path).orderBy('__name__').limit(500);
  
  const snapshot = await query.get();

  if (snapshot.size === 0) {
    // When there are no documents left, we are done
    return;
  }

  const batch = db.batch();

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  if (snapshot.size < 500) {    
    // delete pending
    batch.delete(change.after.ref);
  }

  await batch.commit();

  return;

});



  async function deleteCollection(db, collectionPath, batchSize) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);
  
    return new Promise((resolve, reject) => {
      deleteQueryBatch(db, query, resolve).catch(reject);
    });
  }
  
  
  async function deleteQueryBatch(db, query, resolve) {

    const snapshot = await query.get();
  
    const batchSize = snapshot.size;
    if (batchSize === 0) {
      // When there are no documents left, we are done
      resolve();
      return;
    }
  
    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  
    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
      deleteQueryBatch(db, query, resolve);
    });
  }

  */



  /*


  const query = collectionRef.orderBy('__name__').limit(batchSize);
  
  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
  



  console.log(collections.);
  
exports.onDeleteSites = functions.firestore.document('{document=**}').onDelete(({ref}, context) => {
  // Get an object representing the document prior to deletion
  console.log(`onDelete for ${ref.path}`);

  return ref.listCollections().then(collections => {

    if (!collections.length) {
      return Promise.resolve();
    }

    console.info(`Deleting subcollections of: ${ref.path}`)

    return Promise.all( collections.map(collection => {

      console.info(`Deleting subcollection: ${collection.path}`)

      collection.



      return collection.listDocuments().then(documents => {
      
        console.info(`Deleting documents of subcollection: ${collection.path}`)

        return Promise.all( documents.map(document => {

          // recursive
          document.parent
          return document.delete().then(writeResult => console.info(`Document deleted: ${document.path}`), error => console.error(error))

        }));

      });

    })); // end Promise.all( collections

  }); // end ref.listCollections()

});
*/