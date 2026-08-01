const fs = require('fs');
let content = fs.readFileSync('src/views/StudentSquads.tsx', 'utf8');

const createTarget = `      await addDoc(collection(db, "squads"), {
        name: newSquadName.trim(),
        description: newSquadDesc.trim(),
        courseId: selectedCourse,
        courseTitle: courseDetails?.title || "Cours inconnu",
        creatorId: currentUser.uid,
        membersCount: 1,
        membersList: [currentUser.uid],
        createdAt: serverTimestamp()
      });`;

const createReplacement = `      // 1. Create Google Chat Space
      let chatSpaceName = "";
      try {
        const token = await currentUser.getIdToken();
        const chatRes = await fetch('/api/chat/create-space', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${token}\`
          },
          body: JSON.stringify({ spaceName: newSquadName.trim() })
        });
        const chatData = await chatRes.json();
        if (chatData.success && chatData.space) {
          chatSpaceName = chatData.space.name; // the API space name (e.g. spaces/XXXXX)
          
          // 2. Add creator to the space
          await fetch('/api/chat/add-member', {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
               'Authorization': \`Bearer \${token}\`
             },
             body: JSON.stringify({ spaceName: chatSpaceName, email: currentUser.email })
          });
        }
      } catch (err) {
        logger.error("Error creating Google Chat space", err);
      }

      await addDoc(collection(db, "squads"), {
        name: newSquadName.trim(),
        description: newSquadDesc.trim(),
        courseId: selectedCourse,
        courseTitle: courseDetails?.title || "Cours inconnu",
        creatorId: currentUser.uid,
        membersCount: 1,
        membersList: [currentUser.uid],
        chatSpaceName: chatSpaceName,
        createdAt: serverTimestamp()
      });`;

const joinTarget = `        if (isMember) {
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
        }`;

const joinReplacement = `        if (isMember) {
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
        }`;

if(content.includes(createTarget)) {
    content = content.replace(createTarget, createReplacement);
    // for join we just add the API call after the transaction
}
fs.writeFileSync('src/views/StudentSquads.tsx', content);
