import { Router } from 'express';
import axios from 'axios';

const router = Router();
const WEAVIATE_URL = 'http://localhost:8080/v1/objects';

router.post('/', async (req, res) => {
    try {
        const { company, title, description } = req.body;

        const data = {
            class: "JobPostings",
            properties: { company, title, description }
        };

        const response = await axios.post(WEAVIATE_URL, data, {
            headers: { "Content-Type": "application/json" }
        });

        res.json({ success: true, data: response.data });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

export default router;
