import config from "./config/config";
import app from "./app";

app.listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
})
