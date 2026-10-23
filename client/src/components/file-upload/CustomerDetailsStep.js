import React from 'react';

import UserInfoFields from '../UserInfoFields';
import GalleryUploadProgress from '../GalleryUploadProgress';

const CustomerDetailsStep = ({
  userInfo,
  setUserInfo,
  uploadFinishedSuccessfully,
  uploading,
  fileUploadPercentage,
  files
}) => (
  <div className="row">
    <div className="col l6 m12">
      <UserInfoFields
        userInfo={userInfo}
        setUserInfo={setUserInfo}
        uploadFinished={uploadFinishedSuccessfully}
        uploading={uploading}
      />
    </div>
    <GalleryUploadProgress
      fileUploadPercentage={fileUploadPercentage}
      files={files}
    />
  </div>
);

export default CustomerDetailsStep;
