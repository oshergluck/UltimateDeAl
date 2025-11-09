import React from 'react';
import { useStateContext } from '../context';
import {Anonuser} from '../assets'

const Investors = ({ investors, websiteComment }) => {
  const { HexToInteger } = useStateContext();

  // Transform investors data structure to array of objects
  let investorArray = [];
  if (investors && investors.addresses && investors.amounts && investors.comments) {
    investorArray = investors.addresses.map((address, index) => ({
      address: address,
      investment: investors.amounts[index],
      comment: investors.comments[index],
      profilePic: investors.pics[index],
      name: investors.names[index]
    }));
  }

  // Sort the investors array by investment amount in descending order
  const sortedInvestors = investorArray.length > 0
    ? investorArray.sort((a, b) => (HexToInteger(b.investment._hex) || 0) - (HexToInteger(a.investment._hex) || 0))
    : [];


  return (
    <div className="mt-[10px]">
      {sortedInvestors.length > 0 ? (
        sortedInvestors.map((item, index) => (
          <div key={index} className="mt-[10px] border-b-[#424242] border-b-[1px]">
            <div>
            {websiteComment === "Refunded because of illegal activity" ? (
                <p className="font-epilogue font-normal text-[14px] text-[#FFFFFF] mx-[10px] drop-shadow-md">Refunded</p>
              ):(<></>)}
              <div className='grid grid-rows-0 gap-0 grid-flow-col'>
                {item?.profilePic===``?(<><img src={Anonuser} alt='avatar' className='row-span-3 rounded-[100px] w-50px h-[50px]'/></>):(<><img src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${item?.profilePic}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`} alt='avatar' className='row-span-3 rounded-[100px] w-50px h-[50px]'/></>)}
              {item?.name!=='' ? (<p className="col-span-2 ml-[15px] flex font-epilogue font-semibold text-[17px] text-[#FFFFFF] drop-shadow-md truncate">{item?.name}</p>)
              :
              ( <p className='col-span-2 ml-[15px] flex font-epilogue font-semibold text-[17px] text-[#FFFFFF] drop-shadow-md truncate'>Anonymous</p>)
              }
              <a className="col-span-2 flex ml-[15px] font-epilogue font-semibold text-[12px] opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out text-[#FFFFFF] drop-shadow-md hover:text-[#00FFFF] truncate" target="_blank" href={`https://base.blockscout.com/address/${item.address}`}>{item.address || 'Unknown'}</a>
              </div>
              
              <p className="mt-[10px] col-span-2 flex ml-[65px] font-epilogue font-bold text-[18px] text-[#fc941c] font-bold drop-shadow-md">{HexToInteger(item?.investment._hex)/1e6 || 0}USD Coin Support</p>
              <p className="font-epilogue col-span-2 flex ml-[65px] font-semibold text-[16px] text-[#FFFFFF] drop-shadow-md my-[10px]">{item?.comment || 'No comment'}</p>
           
              
           
            </div>
          </div>
        ))
      ) : (
        <p className="font-epilogue font-normal text-[16px] text-[#808191] ml-[20px]">No investors yet.</p>
      )}
    </div>
  );
};

export default Investors;
