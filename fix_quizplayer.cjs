const fs = require('fs');
let code = fs.readFileSync('src/views/QuizPlayer.tsx', 'utf8');

// Replace client-side grading logic with API call
const submitReplacement = `
  const submitQuiz = async () => {
    try {
      setLoading(true);
      const token = await firebaseUser?.getIdToken();
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({
          quizId: quiz.id,
          courseId,
          answers
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setScore(data.score);
        setShowResults(true);
        if (data.passed && onComplete) {
          onComplete();
        }
      } else {
        alert("Erreur: " + data.error);
      }
    } catch(e) {
      console.error(e);
      alert("Erreur de soumission");
    } finally {
      setLoading(false);
    }
  };
`;

code = code.replace(/const submitQuiz = async \(\) => \{[\s\S]*?(?=const formatTime =)/, submitReplacement);

fs.writeFileSync('src/views/QuizPlayer.tsx', code);
