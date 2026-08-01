const fs = require('fs');
let content = fs.readFileSync('src/views/StudentSquads.tsx', 'utf8');

const target = `      await runTransaction(db, async (transaction) => {
        const squadDoc = await transaction.get(squadRef);
        if (!squadDoc.exists()) {
          throw new Error("Cette Squad n'existe plus.");
        }

        const data = squadDoc.data() as Squad;
        const currentList = data.membersList || [];
        
        if (isMember) {
          // Leave squad
          const newList = currentList.filter(id => id !== currentUser.uid);
          transaction.update(squadRef, {
            membersList: newList,
            membersCount: newList.length
          });
        } else {
          // Join squad
          if (currentList.includes(currentUser.uid)) return; // already in
          const newList = [...currentList, currentUser.uid];
          transaction.update(squadRef, {
            membersList: newList,
            membersCount: newList.length
          });
        }
      });

      setActionStatus({ 
        type: 'success', 
        text: isMember ? 'Vous avez quitté la Squad.' : 'Vous avez rejoint la Squad !' 
      });`;

const replacement = `      await runTransaction(db, async (transaction) => {
        const squadDoc = await transaction.get(squadRef);
        if (!squadDoc.exists()) {
          throw new Error("Cette Squad n'existe plus.");
        }

        const data = squadDoc.data() as Squad;
        const currentList = data.membersList || [];
        
        if (isMember) {
          // Leave squad
          const newList = currentList.filter(id => id !== currentUser.uid);
          transaction.update(squadRef, {
            membersList: newList,
            membersCount: newList.length
          });
        } else {
          // Join squad
          if (currentList.includes(currentUser.uid)) return; // already in
          const newList = [...currentList, currentUser.uid];
          transaction.update(squadRef, {
            membersList: newList,
            membersCount: newList.length
          });
        }
      });
      
      // If joined successfully and squad has a chatSpaceName, add user to space
      if (!isMember && squad.chatSpaceName) {
         try {
           const token = await currentUser.getIdToken();
           await fetch('/api/chat/add-member', {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
               'Authorization': \`Bearer \${token}\`
             },
             body: JSON.stringify({ spaceName: squad.chatSpaceName, email: currentUser.email })
           });
         } catch(e) {
           logger.error("Failed to add user to chat space", e);
         }
      }

      setActionStatus({ 
        type: 'success', 
        text: isMember ? 'Vous avez quitté la Squad.' : 'Vous avez rejoint la Squad !' 
      });`;

if(content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/views/StudentSquads.tsx', content);
    console.log("Patched join");
} else {
    console.log("Could not patch join");
}
