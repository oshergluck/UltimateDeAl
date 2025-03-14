import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Comments from '../components/Comments';
import { useStateContext} from '../context';
import { CustomButton, Loader,FormField,IPFSMediaViewer} from '../components';
import { profile,ProfilePhotoOsher} from '../assets';
import Featured from '../components/Featured';
import {fontSizes} from '../components/AccessibilityMenu';
import {MediaRenderer } from '@thirdweb-dev/react';
import { TransactionButton } from 'thirdweb/react';
import { prepareContractCall } from 'thirdweb';

const Post = () => {
  
  

  const ProfileRooby=import.meta.env.VITE_ROOBY;
  const { state } = useLocation();
  const navigate = useNavigate();
  const { address, Blog,Blog1, getAllBlogPosts, getBlogPost,getComments,formatDate,hexToTimestamp,commentToBlogPost ,likeComment,refreshPage,getTotal,DEVS} = useStateContext();
  const postId = parseInt(window.location.pathname.split('/')[2]); 
  
  //if (!state) {navigate("/campaign-details/"+campaignId)}
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComment] = useState([]);
  const [comment, setNewComment] = useState('');
  const [commenterprofilepicture, setprofilepicture] = useState('');
  const [writerName, setName] = useState('');
  const [likes, setLikes] = useState([]);
  const [post, setPost] = useState(null);
  const [form, setForm] = useState({
    commenter: '',
    comment: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchPost() {
        if (Blog) {
            const fetchedPost = await getBlogPost(Number(postId));
            if (fetchedPost) {
                setPost(fetchedPost);
                fetchComments(fetchedPost);
                setIsLoading(false);
                return;
            }
        }
      }
      if(Blog) {
    fetchPost();
      }
}, [Blog]);

function renderDescriptionWithBreaks(description) {
  if (!description) return <p>No description provided.</p>;

  const processText = (text) => {
    const sanitizedText = text.replace(/[\s\uFEFF\xA0]+/g, ' ');
      const nodes = [];
      let currentText = '';
      let styles = [];

      for (let i = 0; i < sanitizedText.length; i++) {
        const char = sanitizedText[i];

        if (char === '~' || char === '*' || char === '^' || char === '$') {
            if (currentText) {
                nodes.push({ text: currentText, styles: [...styles] });
                currentText = '';
            }
            const styleIndex = styles.indexOf(char);
            if (styleIndex > -1) {
                styles.splice(styleIndex, 1);
            } else {
                styles.push(char);
            }
            continue;
        }

        currentText += char;
    }

    if (currentText) {
      nodes.push({ text: currentText, styles: [...styles] });
  }

  return nodes.map((node, index) => {
    let element = <span key={index}>{node.text}</span>;

    node.styles.forEach(style => {
        const defaultFontSizeIndex = fontSizes.indexOf('sm');
        const defaultSize = fontSizes[defaultFontSizeIndex-3];

        switch (style) {
            case '~':
                element = <span key={index} className={`text-[#FFDD00] text-${defaultSize}`}>{element}</span>;
                break;
            case '*':
                element = <strong key={index} className={`text-${defaultSize}`}>{element}</strong>;
                break;
            case '$':
                element = <span key={index} className={`text-center block my-[10px] text-${defaultSize}`}>{element}</span>;
                break;
            case '^':
                const fontSizeIndex = fontSizes.indexOf('sm') + 2;
                const size = fontSizes[fontSizeIndex];
                element = <span key={index} className={`text-${size}`}>{element}</span>;
                break;
            default:
                element = <span key={index} className={`text-${defaultSize}`}>{element}</span>;
                break;
        }
    });

    return element;
});
  };

  const lines = description.split('\n').map((line, index) => (
      <div key={index} className="whitespace-pre-wrap">
          {processText(line)}
      </div>
  ));

  return (
      <div className="font-epilogue text-[#FFFFFF]">
          {lines}
      </div>
  );
}


  const fetchComments = async (post) => {
    if((state||post)&&Blog) {
    if(post?.commentsWithLikes) {
      const data = post.commentsWithLikes;
    setComment(data);
    setIsLoading(false);
    return data;
  }
    }
  else {
    setIsLoading(false);
  }
}


const handleFormFieldChange = (fieldName, e) => {
  setForm({ ...form, [fieldName]: e.target.value });
}

  const handleComment = async () => {
    try{
    setIsLoading(true);
      await commentToBlogPost(postId,form)
      setIsLoading(false);
    }
    catch(error) {
      alert(error);
      setIsLoading(false);
    }
  }

  const date = hexToTimestamp(String(post?.dateTimestamp._hex));
  return (
    <div>
      {isLoading && <Loader />}
      <div className="mt-[16px] flex lg:flex-row flex-col gap-5 mt-[50px]">
        <div className="flex-[2] flex flex-col gap-[30px]">
          <div className='rounded-[15px] linear-gradient1 z-[0] pb-[20px] touch-auto overflow-auto'>
        <div className='z-[1] w-11/12 m-auto my-[20px]'>
          <h2 className="font-epilogue font-semibold text-[50px] text-[#FFFFFF] text-left ml-[50px] mt-[65px] drop-shadow-md">News</h2>
          <p className={`font-epilogue font text-[18px] text-[#FFFFFF] text-left ml-[15px] drop-shadow mt-[45px] mb-[30px]`}>{(post?.headline)}</p>

          <div className='grid grid-rows-2 grid-flow-col gap-4 mt-[20px] border-b-[1px] border-[#424242] mb-[25px]'>
                    <div className='row-span-3 w-[75px] h-[75px]'>
                      {post?.writerName==='Osher Haim Glick' ? (<img src={ProfilePhotoOsher} alt='avatar' className='w-[75px] h-[75px] object-contain rounded-full'/>):(<></>)}
                      {post?.writerName==='Gregory Jefferson' ? (<img src={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${ProfileRooby}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`} alt='avatar' className='w-[75px] h-[75px] object-contain rounded-full'/>):(<></>)}
                    </div>
                             <div className='col-span-2 flex'>
                            <p className='my-auto opacity-[40%] hover:opacity-[100%] duration-500 ease-in-out text-[16px] hover:text-[#4287f5] text-[#FFFFFF] mt-[25px]'>{post?.writerName}</p>
                            </div>
                            <div className='col-span-2 flex mx-[2px]'>
                            <p className="font-epilogue font-bold text-[16px] text-[#FFFFFF] drop-shadow mt-[-15px]">{date}</p>
                            </div>
                        
                        </div>

              </div>
          <div className='z-[1] w-11/12 m-auto'>

                <div>
        {renderDescriptionWithBreaks((post?.text1))}
                 </div>

          </div>
          <br/>
          <div
                    style={{
                      borderRadius: '15px',
                      overflow: 'hidden' // This ensures child content doesn't overflow the rounded corners
                    }}
                    className={`w-11/12 mx-auto my-[5px] rounded-[15px]`}
                  >
                    <IPFSMediaViewer
                    ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${post?.imageUrls1}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                    />
                  </div>

          <br/>
          <div
                    style={{
                      borderRadius: '15px',
                      overflow: 'hidden' // This ensures child content doesn't overflow the rounded corners
                    }}
                    className={`w-11/12 mx-auto my-[5px] rounded-[15px]`}
                  >
                    <IPFSMediaViewer
                    ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${post?.imageUrls2}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                    />
                  </div>
          <br/>
          <div className='z-[1] w-11/12 m-auto'>
                <div className={`rounded-[2px] p-[10px] w-full`}>
                <div>
        {renderDescriptionWithBreaks((post?.text2))}
                 </div>
              </div>
          </div>
          <br/>
          <div
                    style={{
                      borderRadius: '15px',
                      overflow: 'hidden' // This ensures child content doesn't overflow the rounded corners
                    }}
                    className={`w-11/12 mx-auto my-[5px] rounded-[15px]`}
                  >
                    <IPFSMediaViewer
                    ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${post?.imageUrls3}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                    />
                  </div>
          </div>
          </div>

          <div className="flex-1">  
          <div className=" flex flex-col p-4 rounded-[15px] linear-gradient1">
            <p className="font-epilogue fount-medium text-[20px] leading-[30px] text-center text-[#ffffff] drop-shadow-md">
              Comment
            </p>
            <div className="mt-[10px] w-full">
            <div className='!w-10/12 mx-auto flex flex-col mb-[20px]'>
              <FormField 
                type="text"
                placeholder="Name"
                id = "commenter"
                className="!bg-[#424242] placeholder:[#FFFFFF] drop-shadow-md w-full p-4 outline-none border-[1px] border-[#3a3a43] bg-[#ffffff] font-epilogue text-gray text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[5px] flex flex-col items-center mb-[10px]"
                value={form.commenter}
                maxLength={25}
                handleChange={(e) => handleFormFieldChange('commenter', e)}
              />
              </div>
              <div className='!w-10/12 mx-auto flex flex-col mb-[20px]'>
                <FormField
                  type="text"
                  id="comment"
                  isTextArea
                  value={form.comment}
                  handleChange={(e) => handleFormFieldChange('comment', e)}
                  maxLength={50}
                  placeholder="Comment maximum 50 characters"
                  className='!bg-[#424242] drop-shadow-md outline-none border-[1px] border-[#3a3a43] bg-[#ffffff] font-epilogue text-gray text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[5px] mt-[10px] flex flex-col items-center mb-[10px]'
                />
                </div>
                <div className='w-full flex flex-col items-center mb-[15px]'>
                <TransactionButton
                disabled={form.comment.length<1}
                    className={"!mb-[15px] !bg-orange-500 opacity-[75%] hover:opacity-[100%] text-black font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out"}
                    transaction={() => {
                      // Create a transaction object and return it
                      const tx = prepareContractCall({
                        contract:Blog1,
                        method: "function commentOnBlog(uint256 postId, string commenterName, string commentText)",
                        params: [postId, form.commenter ,form.comment],
                        value: 0,
                      });
                      return tx;
                    }}
                    onTransactionSent={(result) => {
                      console.log("Transaction submitted", result.transactionHash);
                    }}
                    onTransactionConfirmed={(receipt) => {
                      console.log("Transaction confirmed", receipt.transactionHash);
                      setIsLoading(false);
                      refreshPage();
                    }}
                    onError={(error) => {
                      console.error("Transaction error", error);
                      setIsLoading(false);
                      alert(error);
                    }}
                  >
                    Comment
                  </TransactionButton>
              </div>
             </div>
          </div>
          <h2 className='text-white text-xl font-bold mb-[15px]'>Comments:</h2>
          <Comments comments={post?.commentsWithLikes} postId={postId}/>
        </div>
        </div>
        
      </div>
  )
}

export default Post