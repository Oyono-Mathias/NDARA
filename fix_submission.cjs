const fs = require('fs');
const file = 'src/views/instructor/InstructorCourseEdit.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add import for useCourseBuilder
if (!code.includes('useCourseBuilder')) {
    code = code.replace(
        "import { Link, useParams } from \"react-router-dom\";",
        "import { Link, useParams } from \"react-router-dom\";\nimport { useCourseBuilder } from \"../../hooks/catalog/useCatalogAdmin\";"
    );
}

// Call useCourseBuilder
if (!code.includes('const { chapters, lessons }')) {
    code = code.replace(
        "const { currentUser } = useRole();",
        "const { currentUser } = useRole();\n  const { chapters, lessons, loading: builderLoading } = useCourseBuilder(courseId!);"
    );
}

// Check conditions in handleSubmitForReview
code = code.replace(
    /const handleSubmitForReview = async \(\) => \{([\s\S]*?)setIsSubmittingReview\(true\);/m,
    `const handleSubmitForReview = async () => {
    if (!currentUser?.uid || !course?.id) {
      logger.error("Erreur: Utilisateur non connecté ou ID cours manquant.");
      return;
    }

    const missing = [];
    if (!course.title) missing.push("Titre");
    if (!course.description) missing.push("Description");
    if (!course.thumbnail) missing.push("Image de couverture");
    if (course.price === undefined || course.price < 0) missing.push("Prix");
    if (!course.totalModules || course.totalModules < 1) missing.push("Nombre de modules");
    if (!course.totalVideos || course.totalVideos < 1) missing.push("Nombre total de vidéos");
    if (chapters.filter(c => c.status !== 'archived').length === 0) missing.push("Au moins 1 chapitre");
    if (lessons.filter(l => l.status !== 'archived').length === 0) missing.push("Au moins 1 leçon");

    if (missing.length > 0) {
        toast({
            variant: "destructive",
            title: "Impossible de soumettre",
            description: "Veuillez renseigner : " + missing.join(", ")
        });
        return;
    }

    setIsSubmittingReview(true);`
);

fs.writeFileSync(file, code);
