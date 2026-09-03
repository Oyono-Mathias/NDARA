const fs = require('fs');
let content = fs.readFileSync('src/views/Landing.tsx', 'utf8');

// Footer Plateforme
content = content.replace(/<li><Link to="#">Catalogue<\/Link><\/li>/g, '<li><Link to="/catalog">Catalogue</Link></li>');
content = content.replace(/<li><Link to="#">Instructeurs<\/Link><\/li>/g, '<li><button onClick={() => handleScrollTo(\'instructors\')}>Instructeurs</button></li>');
content = content.replace(/<li><Link to="#">Tarifs<\/Link><\/li>/g, '<li><button onClick={() => handleScrollTo(\'pricing\')}>Tarifs</button></li>');
content = content.replace(/<li><Link to="#">Entreprises<\/Link><\/li>/g, '<li><button onClick={() => handleScrollTo(\'pricing\')}>Entreprises</button></li>');

// Footer Ressources
content = content.replace(/<li><Link to="#">Blog<\/Link><\/li>/g, '<li><Link to="/catalog">Blog</Link></li>');
content = content.replace(/<li><Link to="#">Centre d\\'aide<\/Link><\/li>/g, '<li><Link to="/legal">Centre d\\'aide</Link></li>');
content = content.replace(/<li><Link to="#">Communauté<\/Link><\/li>/g, '<li><Link to="/register">Communauté</Link></li>');
content = content.replace(/<li><Link to="#">Webinaires<\/Link><\/li>/g, '<li><Link to="/catalog">Webinaires</Link></li>');

// Footer Légal
content = content.replace(/<li><Link to="#">CGU<\/Link><\/li>/g, '<li><Link to="/legal">CGU</Link></li>');
content = content.replace(/<li><Link to="#">Confidentialité<\/Link><\/li>/g, '<li><Link to="/legal">Confidentialité</Link></li>');
content = content.replace(/<li><Link to="#">Cookies<\/Link><\/li>/g, '<li><Link to="/legal">Cookies</Link></li>');
content = content.replace(/<li><Link to="#">RGPD<\/Link><\/li>/g, '<li><Link to="/legal">RGPD</Link></li>');

fs.writeFileSync('src/views/Landing.tsx', content);
