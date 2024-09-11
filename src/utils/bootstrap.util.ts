import { findOne, createOne } from '../helpers/db.helpers';
import adminModel from '../models/Admin/admin.auth.model';
import commonContentModel from '../models/Admin/commonContent.model';
import * as commonHelper from '../helpers/common.helper';
import { APP } from '../constants/app.constant'
// import services from '../services';


type CallbackFunction = () => void; // Define the type of the callback function


export const bootstrapAdmin = async function (cb: CallbackFunction) {
  const userPassword = await commonHelper.bycrptPasswordHash("123456");
  const adminData = {
    password: userPassword,
    email: `${APP.ADMIN_CRED_EMAIL}`,
    first_name: 'Admin',
    last_name: 'Account',

  };

  const commonContentData = {
    about: "<p> About us </p>",
    privacy_policy: "<p> Privacy Policy </p>",
    terms_conditions: "<p> Default Terms </p>",
  };

  const adminDoc = await findOne(adminModel, {});
  if (!adminDoc.status) {
    const adminRef = new adminModel(adminData)
    await createOne(adminRef)
  }


  const commonContent = await findOne(commonContentModel, {})
  if (!commonContent.status) {

    const commonContentRef = new commonContentModel(commonContentData)
    await createOne(commonContentRef)
  }

  // Use It If Project Requirement is Image Search 
  //finds all aws RekognitionCollection   
  // let collectionList = await services.awsService.awsFaceRekognitionFunctions.listCollectionAwsRekognition()
  // console.log(collectionList, "collectionList_Bootstrap")
  // const collectionId = AWS_CREDENTIAL.COLLECTION_ID_AWS_REKOGNITION
  // //if collection list function works
  // if (collectionList.status) {
  //   let existCollectionId = collectionList.data.filter((collection_id: any) => collection_id == collectionId)

  //   //if collection id not create till then create a new one 
  //   if (existCollectionId.length == 0) {
  //     let response = await services.awsService.awsFaceRekognitionFunctions.createCollectionAwsRekognition(collectionId)
  //     if (response.status) {
  //       console.log(response.message)
  //     }
  //   }
  // } //ends

  cb();
};