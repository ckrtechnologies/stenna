import { fetchCategories } from './src/services/api.js';

async function diagnose() {
    try {
        const cats = await fetchCategories();
        console.log('--- ALL CATEGORIES ---');
        cats.forEach(c => console.log(`Name: ${c.name} | Slug: ${c.slug}`));
    } catch (e) {
        console.error(e);
    }
}
diagnose();
