import services from "../services";
import * as commonHelper from '../helpers/common.helper'
import { createOne } from "../helpers/db.helpers";
import galleryModel from "../models/Admin/gallery.model";

const initizalizeMediaQueue = (filesObj: any, index: number, buffer: any, QueryData: any) => {
    console.log(index, "indexQueueunder")
    const { media_type } = QueryData
    // let fileBuffer = Buffer.from(buffer); //convert file buffer to orignal buffer

    const QueueName = `Media-${Math.floor(Math.random() * 1000000)}` //create queue name dynamically for every file
    const MediaQueue = commonHelper.generateQueue(QueueName) //generate queue

    //add data in the queue
    MediaQueue.add(filesObj, { //dont include file buffer in array 
        delay: (index * 30000), //30 seconds 
        attempt: 1,
        removeOnComplete: true
    })

    //starts the queue process
    MediaQueue.process(async (job: any, done: any) => {
        let mediaFiles = job?.data //single media in file object

        //upload media to s3  one by one 
        services.awsService.uploadQueueMediaToS3([mediaFiles]).then(async (uploaded_file_url: any) => {
            let addObj = {
                media_type,
                url: uploaded_file_url[0]
            };

            let ref = new galleryModel(addObj)

            let saveMedia = await createOne(ref)
            // console.log(saveMedia, "saveMediaa")
            if (!saveMedia.status) {
                console.log('Error While Save Media in Database')
            }

        }).catch((err) => {
            console.log("Queue error on aws response", err)
        })
        done()
    })

}//ends

export { initizalizeMediaQueue }



