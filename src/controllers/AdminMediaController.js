const Controller = require('./Controller');
const {MediaRepository, EventRepository, ArtistRepository} = require("./../repositories");
const CollectableOutputTransformer = require("./../transformers/collectable/output");
const MediaTransformer = require("./../transformers/media");
const CloudfrontHelper = require("./../utils/CloudfrontHelper");
const urlParse = require('url-parse');
const uploadHelper = require("./../utils/UploadHelper");
const s3Helper = require("./../utils/S3Helper");


class AdminMediaController extends Controller {

    async store(req, res) {
        let fnc = uploadHelper.upload.array("files", 8)
        fnc(req, res, async (err) => {
                if (err) {
                    this.sendError(res, err, 400);
                    return;
                }
                let arr = [];
                for (let i = 0; i < req.files.length; i++) {
                    let file = req.files[i];
                    let url = urlParse(file.location);
                    let path = url.pathname.charAt(0) === '/'
                        ? url.pathname.substr(1, url.pathname.length)
                        : url.pathname
                    let obj = await MediaRepository.create({
                        url: CloudfrontHelper.replaceHost(file.location),
                        type: file.mimetype,
                        position: i,
                        origin_url: file.location,
                        path
                    });
                    arr.push(obj);
                }
                this.sendResponse(res, arr.map(i => MediaTransformer.transform(i)));
            }
        )
    }

    async preview(req, res) {
        const id = req.params.id;
        let media = await MediaRepository.find(id);
        if (!media) {
            return this.sendError(res, "Not Found")
        }
        await MediaRepository.update({is_preview: !media.is_preview }, id);
        this.sendResponse(res, {status: "success"});
    }

    async delete(req, res) {
        const id = req.params.id;
        let media = await MediaRepository.find(id);
        if (!media) {
            return this.sendError(res, "Not Found")
        }
        await MediaRepository.delete(id);
        await (new s3Helper).remove(media.path);
        this.sendResponse(res, {status: "success"});
    }
}

module.exports = AdminMediaController;
