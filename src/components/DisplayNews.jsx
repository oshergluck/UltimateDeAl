import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
import { PostCard, Loader } from './'; // Ensure these components are correctly imported
import { useStateContext } from '../context';
import {useAddress} from '@thirdweb-dev/react'

const DisplayNews = ({ isLoading }) => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [loadIndex, setLoadIndex] = useState(0);
  const [loading, setLoading] = useState(isLoading); // Initially set to isLoading prop
  const { Blog, LoadMorePosts,lastPostIndex,postsLength} = useStateContext();
  const [PostsLength, setPostsLength] = useState();
  const [lastIndex,setLastIndex] = useState();
  
  useEffect(() => {
    const loadInitialPosts = async () => {
      if (Blog) {
        const lastIndex = await lastPostIndex();
        setPostsLength(lastPostIndex+1); // Directly fetch and use lastIndex inside async function
        setLoading(true);
        const newPosts = await LoadMorePosts(lastIndex, lastIndex - 9);
        setPosts(newPosts);
        setLoadIndex(lastIndex - 9);
        setLoading(false);
      }
    };
  
    loadInitialPosts();
  }, [Blog]); // Depend on address and DEVS to re-run effect
  
  const handleLoadMore = async () => {
    setLoading(true); // Show loader while loading
    const newPosts = await LoadMorePosts(loadIndex-1, loadIndex - 10);
    setPosts(prevPosts => [...prevPosts, ...newPosts]);
    setLoadIndex(loadIndex - 10);
    setLoading(false); // Hide loader after loading
  };

  const handleNavigate = (post) => {
    navigate(`/post/${post.parsedPost.pId}`, { state: post });
  };


  return (
    <div className=''>
      <div className='m-auto flex flex-wrap gap-[16px]'>
      {loading && <Loader />}
        {posts?.map((post, index) => (
            <PostCard
              key={uuidv4()}
              post={post}
              handleClick={() => handleNavigate(post[index].parsedPost)}
            />
        ))}
      </div>
      <div className='flex justify-center gap-3'>
        <button className={`bg-transparent border-[1px] border-[#FFFFFF] text-[#FFFFFF] font-semibold text-[16px] py-[10px] px-[30px] rounded-[5px] transition-opacity duration-300 ease-in-out mt-[35px] ${ loadIndex <=0 ? '!hidden' : 'opacity-70 hover:opacity-100'}`} onClick={() => handleLoadMore()}>
          Show Me More
        </button>
        </div>
    </div>
  );
};
12642526
export default DisplayNews;
