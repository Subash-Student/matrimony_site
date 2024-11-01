import profilesModel from "../model/profileModel.js";
import { userModel } from "../model/userModel.js";



// CONTROLLER FOR EDIT USEER PROFILE


export const editProfile = async (req, res) => {
  const {
    name,
    familyName,
    dateOfBirth,
    gender,
    age,
    zodiac,
    HoroscopeImage,
    religion,
    cast,
    fatherName,
    motherName,
    weight,
    height,
    about,
    email,
    hobbies,
    phone,
    address,
    profileImage,
    galleryImages,
    companyName,
    position,
    salary,
    workLocation,
    jobType,
    school,
    college,
    degree,
    socialMedia,
  } = req.body;

  const paramsId = req.params.id;
  const user_id = req.body;
  if(user_id === paramsId){
    return  res.status(403).json({ message: "Unauthorized access" });
  }

  try {
    
    const userExist = await checkUserFound(user_id, "userModel");

    if (!userExist) {
        return res.status(404).json({ success: false, message: " User Not Found" });
    }

    const updatedProfileData = {
      basicInfo: {
        name,
        familyName,
        dateOfBirth,
        gender,
        religion,
        cast,
        zodiac,
        fatherName,
        motherName,
      },
      personalDetails: {
        weight,
        height,
        age,
        about,
        hobbies,
      },
      contactInfo: {
        phone,
        email,
        address,
      },
      media: {
        profileImage,
        galleryImages,
        HoroscopeImage,
      },
      jobDetails: {
        companyName,
        position,
        salary,
        workingLocation: workLocation, 
        jobType,
      },
      education: {
        school,
        college,
        degree,
      },
      socialMedia:socialMedia,
    };

    
    const updatedProfile = await profilesModel.findOneAndUpdate(
      { user_id: user_id },
      updatedProfileData,
      {
        new: true, 
        runValidators: true, 
      }
    );

    if (!updatedProfile) {
      return res.status(404).json({ success: false, message: "Profile Not Found" });
    }

    res.json({ success: true, message: "Successfully Profile Updated", data: updatedProfile });
  } catch (error) {
    console.log(error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({ success: false, message: 'Validation failed', errors });
    } else {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
};


// CONTROLLER FOR EDIT USER SETTINGS


export const editSettings = async (req, res) => {

  const paramsId = req.params.id;
  const userId = req.body;
  if(userId === paramsId){
    return  res.status(403).json({ message: "Unauthorized access" });
  }

  try {
 
    const userExist = await checkUserFound(userId, "userModel");

    if (!userExist) {
        return res.status(404).json({ success: false, message: " User Not Found" });
    }

    
    const { profileVisibleOption, bookmarkOption, notificationPermission } = req.body;

    
    const updateData = {settings:{}};
    if (profileVisibleOption !== undefined) updateData.settings.profileVisibleOption = profileVisibleOption;
    if (bookmarkOption !== undefined) updateData.settings.bookmarkOption = bookmarkOption;
    if (notificationPermission !== undefined) updateData.settings.notificationPermission = notificationPermission;

    let up;

    if (Object.keys(updateData).length > 0) {
      up =  await profilesModel.findOneAndUpdate(
        { user_id: userId },
        updateData,
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({ success: true, message: "Settings updated successfully",data:up });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "error", error: error.message });
  }
};


// CONTROLLER FOR SHARE INTEREST


// export const shareInterest = async (req, res) => {

//   const { senderId } = req.body;
//   const receiverId = req.params.id;

//   try {
      
//       const [senderUserExists, receiverUserExists, senderProfileExists, receiverProfileExists] = await Promise.all([
//           checkUserFound(senderId, "userModel"),
//           checkUserFound(receiverId, "userModel"),
//           checkUserFound(senderId, "profilesModel"),
//           checkUserFound(receiverId, "profilesModel"),
//       ]);

      
//       if (!senderUserExists) {
//           return res.status(404).json({ success: false, message: "Sender User Not Found" });
//       }
//       if (!receiverUserExists) {
//           return res.status(404).json({ success: false, message: "Receiver User Not Found" });
//       }
//       if (!senderProfileExists) {
//           return res.status(404).json({ success: false, message: "Sender Profile Not Found" });
//       }
//       if (!receiverProfileExists) {
//           return res.status(404).json({ success: false, message: "Receiver Profile Not Found" });
//       }

      
      
//       const [senderProfile, receiverProfile] = await Promise.all([
//           profilesModel.findOne({ user_id: senderId }),
//           profilesModel.findOne({ user_id: receiverId })
//       ]);
//        if(receiverProfile.personalDetails)
//       if (
//           senderProfile.planType === receiverProfile.settings.interestRequestOption ||
//           receiverProfile.settings.interestRequestOption === "All User"
//       ) {
//           let requests = [senderId];
//           const newRequest = {
//             personalDetails:{
//               interestList: {
//                   newRequest: requests
//               }

//             }
//           };
          

//           // UPDATE 
          
//           const updatedProfile = await profilesModel.findOneAndUpdate(
//               { user_id: receiverId },
//               newRequest,
//               { new: true, runValidators: true }
//           );

//           if (updatedProfile) {
//               return res.status(200).json({ success: true, message: "Your request has been sent successfully !", data: updatedProfile });
//           } else {
//               return res.status(404).json({ success: false, message: "Failed to update profile" });
//           }
//       } else {
//           return res.status(400).json({ success: false, message: "Interest Request not allowed" });
//       }
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ success: false, message: "An error occurred", error: error.message });
//   }
// };



// // CONTROLLER FOR ACCEPT REQUEST


// export const acceptRequest = async(req,res)=>{

//   const { senderId, receiverId } = req.body;

//   try {
      
//       const [senderUserExists, receiverUserExists, senderProfileExists, receiverProfileExists] = await Promise.all([
//           checkUserFound(senderId, "userModel"),
//           checkUserFound(receiverId, "userModel"),
//           checkUserFound(senderId, "profilesModel"),
//           checkUserFound(receiverId, "profilesModel"),
//       ]);

      
//       if (!senderUserExists) {
//           return res.status(404).json({ success: false, message: "Sender User Not Found" });
//       }
//       if (!receiverUserExists) {
//           return res.status(404).json({ success: false, message: "Receiver User Not Found" });
//       }
//       if (!senderProfileExists) {
//           return res.status(404).json({ success: false, message: "Sender Profile Not Found" });
//       }
//       if (!receiverProfileExists) {
//           return res.status(404).json({ success: false, message: "Receiver Profile Not Found" });
//       }

      
      
//       const [senderProfile, receiverProfile] = await Promise.all([
//           profilesModel.findOne({ user_id: senderId }),
//           profilesModel.findOne({ user_id: receiverId })
//       ]);
     
//       let requests = receiverProfile.personalDetails.interestList.acceptRequest;
//       requests.push(senderId); 

//       const newRequest = {
//         personalDetails:{
//           interestList: {
//             acceptRequest : requests
//           }

//         }
//       };

//       const updatedProfile = await profilesModel.findOneAndUpdate({user_id:receiverId},newRequest,{ new: true, runValidators: true })
         
//       if (updatedProfile) {
//         return res.status(200).json({ success: true, message: "Interest Accepted !", data: updatedProfile });
//     } else {
//         return res.status(404).json({ success: false, message: "Failed to update profile" });
//     }

//     }
//     catch(error){
//          console.log(error);
//       return res.status(500).json({ success: false, message: "An error occurred", error: error.message });

//     }
// }


// // CONTROLLER FOR DENY REQUEST


// export const denyRequest = async(req,res)=>{

//   const { senderId, receiverId } = req.body;

//   try {
      
//       const [senderUserExists, receiverUserExists, senderProfileExists, receiverProfileExists] = await Promise.all([
//           checkUserFound(senderId, "userModel"),
//           checkUserFound(receiverId, "userModel"),
//           checkUserFound(senderId, "profilesModel"),
//           checkUserFound(receiverId, "profilesModel"),
//       ]);

      
//       if (!senderUserExists) {
//           return res.status(404).json({ success: false, message: "Sender User Not Found" });
//       }
//       if (!receiverUserExists) {
//           return res.status(404).json({ success: false, message: "Receiver User Not Found" });
//       }
//       if (!senderProfileExists) {
//           return res.status(404).json({ success: false, message: "Sender Profile Not Found" });
//       }
//       if (!receiverProfileExists) {
//           return res.status(404).json({ success: false, message: "Receiver Profile Not Found" });
//       }

      
      
//       const [senderProfile, receiverProfile] = await Promise.all([
//           profilesModel.findOne({ user_id: senderId }),
//           profilesModel.findOne({ user_id: receiverId })
//       ]);
     
//       let requests = receiverProfile.personalDetails.interestList.denyRequest;
//       requests.push(senderId); 

//       const newRequest = {
//         personalDetails:{
//           interestList: {
//             denyRequest : requests
//           }

//         }
//       };

//       const updatedProfile = await profilesModel.findOneAndUpdate({user_id:receiverId},newRequest,{ new: true, runValidators: true })
         
//       if (updatedProfile) {
//         return res.status(200).json({ success: true, message: "Interset Denyed !", data: updatedProfile });
//     } else {
//         return res.status(404).json({ success: false, message: "Failed to update profile" });
//     }

//     }
//     catch(error){
//          console.log(error);
//       return res.status(500).json({ success: false, message: "An error occurred", error: error.message });

//     }


// }


// CONROLLER FOR ADD BOOKMARK PROFILE


export const addBookmark = async(req,res)=>{

const{userId,bookmarkProfileId}=req.body;

try {
    
  const user = await profilesModel.findOne({user_id:userId});
  

  if(!user){
    return res.json({ message: 'User not found' });
  }


  const bookmarkProfile = await profilesModel.findOne({user_id:bookmarkProfileId});
  if(!bookmarkProfile){
    return res.json({ message: 'bookmark profile not found' });
  }



  const existingUser = user.bookMarkedProfiles.find(profile => profile.userId === bookmarkProfileId)
  
  if(!existingUser){
          user.bookMarkedProfiles.push({ userId: bookmarkProfileId, time: new Date() });
          user.activitys.push({userId: bookmarkProfileId, time: new Date(), event:`${bookmarkProfile.basicInfo.name} Bookmarked Your Profile` });
          await user.save();
          return res.json({ message: 'Bookmark Added ', bookmarks: user.bookMarkedProfiles,success:true });
        }
        return res.json({success:false, message: 'already Bookmarked !', viewCount: user.viewCount });
 
} catch (error) {
    console.log(error);
    return res.json({ success: false, message: "An error occurred", error: error.message });

}

}


// CONTROLLER FOR REMOVE BOOKMARK PROFILE


export const removeBookmark = async(req,res)=>{

  const{userId,bookmarkedProfileId}=req.body;

try {
    
  const user = await profilesModel.findOne({user_id:userId});
  if(!user){
    return res.json({ message: 'User not found' });
  }
  const bookmarkProfile = await profilesModel.findOne({user_id:bookmarkedProfileId});
  if(!bookmarkProfile){
    return res.json({ message: 'bookmark profile not found' });
  }

const isExist = user.bookMarkedProfiles.find(profile => profile.userId === bookmarkedProfileId);

if(isExist){
  var index = user.bookMarkedProfiles.indexOf(bookmarkedProfileId);
  user.bookMarkedProfiles.splice(index,1);

  await user.save();
  return res.json({success:true,message:"bookmark Removed",data:user.bookMarkedProfiles});
}

return res.json({ success: false, message: " User Profile Not Found" });

}catch(error){
  console.log(error);
  return res.json({ success: false, message: "An error occurred", error: error.message });
}

}



// CONTROLLER FOR GET PROFILE DATA



export const getProfileData = async(req,res)=>{
  
  const paramsId = req.params.id;
  const userId = req.body;
  if(userId === paramsId){
    return  res.status(403).json({ message: "Unauthorized access" });
  }

try {
  const [user ,profile] = await Promise.all([
    checkUserFound(userId, "userModel"),
    checkUserFound(userId, "profilesModel"),
]);

if(!user){
  return res.status(404).json({ success: false, message: " User Not Found" });
}
if(!profile){
  return res.status(404).json({ success: false, message: " User Profile Not Found" });
}
  
const data = await profilesModel.findOne({user_id:userId});

res.json({success:true,data:data});

} catch (error) {
  console.log(error);
  return res.json({ success: false, message: "An error occurred", error: error.message });
}

}


// CONTROLLER FOR VIEWS COUNT


export const handleViewCount = async(req,res)=>{
  
  const userId = req.params.id;

  const {viewerId} = req.body;

  try {
    
    const user = await profilesModel.findOne({user_id:userId});
    if(!user){
      return res.json({ message: 'User not found' });
    }
    const viewer = await profilesModel.findOne({user_id:viewerId});
    if(!viewer){
      return res.json({ message: 'User not found' });
    }

    const existingUser = user.viewedBy.find(view => view.userId === viewerId)
    
    if(!existingUser){
            user.viewCount += 1;
            user.viewedBy.push({ userId: viewerId, time: new Date() });
            user.activitys.push({userId: viewerId, time: new Date(), event:`${viewer.basicInfo.name} Viewed Your Profile` });
            await user.save();
            return res.json({ message: 'View count updated', viewCount: user.viewCount });
          }
          return res.json({success:false, message: 'already viewed', viewCount: user.viewCount });
   
  } catch (error) {
      console.log(error);
      return res.json({ success: false, message: "An error occurred", error: error.message });

  }

}


// CONTROLLER FOR GET LATEST PROFILE


export const getLatestProfile = async(req,res)=>{

  try {
    
    const allProfiles = await profilesModel.find({});
  
    const sortedProfiles = allProfiles.sort((a,b)=>  new Date(b.createdAt) - new Date(a.createdAt));

    res.json({success:true,data:sortedProfiles});


  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "An error occurred", error: error.message });
  }

}


// CONTROLLER FOR GET SEARCHRESULT


export const getSearchResult = async (req, res) => {
  const { gender, age, zodiac, cast } = req.body;

  try {
    const allProfiles = await profilesModel.find({});
    

    const filtered = allProfiles.filter(profile => {
      const matchesGender = !gender || profile.basicInfo.gender.toLowerCase() === gender.toLowerCase();
      const matchesAge = !age || profile.personalDetails.age === age;
      const matchesCast = !cast || profile.basicInfo.cast.toLowerCase() === cast.toLowerCase();
      const matchesZodiac = !zodiac || profile.basicInfo.zodiac.toLowerCase() === zodiac.toLowerCase();

      return matchesGender && matchesAge && matchesCast && matchesZodiac;
    });
  
    if(filtered.length > 0){
     return res.json({ success: true, data: filtered });
    }
     res.json({success:false,message:"Sorry ! No Matches Found "});

  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "An error occurred", error: error.message });
  }
};




// FUNCTION TO CHECK  USER OR PROFILE IS FOUND


const checkUserFound = async (id, model) => {
  try {
      let user;
      if (model === "profilesModel") {
          user = await profilesModel.findOne({ user_id: id });
      } else {
          user = await userModel.findById(id);
      }
      return !!user; 
      
      
  } catch (error) {
      console.error(error);
      throw new Error("Database error occurred"); 
      
  }
};
