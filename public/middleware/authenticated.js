/*
let watchLoginStatus = (root) => {
    // call only once
    watchLoginStatus = () => {}
  
    firebase.auth().onAuthStateChanged(async user => {
  
      console.log(user);
      if (user === null && !root.route.meta.some(record => record.guest) ) {
        root.redirect({ name: 'login'}, { redirect_to: root.route.fullPath })
      }
  
    })
  
  }
*/
export default async function ( root ) {

    // If the user is not authenticated
    //console.log("authenticated missdle", context.$firebase.auth().currentUser)
    //console.log(context.store.state.user.user)

    //enforceSessionDuration(root)
    //console.log(root);

    //console.log(root.route.meta);

    const user = await new Promise( resolve => {
        let unsubscribe = root.$firebase.auth().onAuthStateChanged( user => { unsubscribe(); resolve(user) } )
    })

    //console.log("middle user", user);

    if (user === null ) {
      root.redirect({ name: 'login'}, { redirect_to: root.route.fullPath })
    } else {
     // watchLoginStatus(root)
    }

}