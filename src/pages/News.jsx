import React, {useState,useEffect} from 'react'
import { DisplayNews, Featured,FeaturedMobile,Loader} from '../components';
import { useMediaQuery } from 'react-responsive';
const News = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
  },[]);
  return (
    <div>
      {isLoading && <Loader />}
        <h1 className='text-white font-epilogue font-semibold text-[20px] my-[20px] ml-[30px]'>Blog</h1>

        <div className='flex min-h-[1000px]'>
            
            <DisplayNews/>
            
            </div>





    </div>
  )
}

export default News;