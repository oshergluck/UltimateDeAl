import React, { useState, useEffect } from 'react'

import { DisplayUserCampaigns } from '../components';
import { useStateContext } from '../context'

const Profile = () => {

    const { CrowdFunding } = useStateContext();

  return (<>
    <div className='text-[#FFFFFF] text-[25px] font-semibold my-[30px] min-h-[1000px] mb-[40px]'>My Campaigns
        <DisplayUserCampaigns/>
        </div>
    </>
  )
}

export default Profile