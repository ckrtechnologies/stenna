import './config/env.js';
import app from './app.js';

const PORT = process.env.PORT || 5010;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
