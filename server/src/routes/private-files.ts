
import * as express from "express";
import path from "path";


const router = express.Router();


router.get("/:conversation/:file", async (req: any, res: express.Response): Promise<any> => {
	try {

		const { conversation, file } = req.params;

		console.log(conversation, file);

		const filePath = path.join(__dirname, `../../chat_uploads/${conversation}/${file}`);

		return res.sendFile(filePath, (error) => {
			if (error) return;
		});

	}
	catch (error) {
		console.log(error);
		return;
	}
})

export = router;