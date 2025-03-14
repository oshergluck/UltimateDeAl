import { CustomButton } from '../components'
import { useStateContext } from '../context'
import React, { useState, useEffect } from 'react'
import {UltimateDealStartUp} from '../assets';
import {fontSizes} from '../components/AccessibilityMenu';

const ListingInfo = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
      },[]);
    const [desc, setDesc] = useState(`~*^$List Your Business Today with UltimateDeAl!$^*~

~*^1. Elevate Your Business with ESH Token Protocol^*~
~Unlock the potential of the ESH protocol~, designed to function just like shares from the stock market. This innovative protocol allows you to distribute dividends as airdrops using USDT,ETH or which ERC-20 on base as payment. Just like major corporations use stock shares to attract investors and reward shareholders, you too can harness this power. With the ESH protocol, you'll experience the same mechanisms that top global companies use to reward shareholders and drive growth. This is a core component of our package.

~*^2. Empower Your Customers with a Voting System^*~
~Give your customers a voice in your business decisions~. With our voting system, customers can influence the direction of your business by holding shares. The more shares they hold, the greater their voting power. This is similar to how companies like Apple and Microsoft give shareholders voting rights to decide on critical company issues. Made possible by a special code of ThirdWeb.

~*^3. Launch Your Own Store and Maximize Profits^*~
Open your store, start selling products, and generate profits. You have the freedom to decide the amount of dividends to distribute to your shareholders. Think of it like running your own Amazon store but with the added advantage of rewarding loyal customers and investors with dividends and shares.

~*^4. Reward Buyers with Smart Share Distribution^*~
Implement a smart mechanism to reward your product buyers with shares. You only need to deposit shares once, and you can choose the amount to deposit, ensuring flexibility and control. This incentivizes purchases and fosters loyalty, much like how Starbucks rewards its customers with points for each purchase, but here, you're using shares. ~(Not a must...)~

~*^5. Manage Your Reward Pool Efficiently^*~
Easily withdraw or increase the reward pool *Of Shares* at your discretion, providing you with complete control over your business's reward system. Adapt and adjust as your business grows. (To reward your clients even more!)

~*^6. Seamless Inventory Management^*~
Keep track of your inventory with ease, ensuring smooth operations and efficient stock management. Avoid stockouts and overstocking, keeping your business running efficiently.

~*^7. Streamlined Invoice Management^*~
Manage invoices effortlessly, making it simple to keep your business finances in order. Ensure accuracy and transparency in all your transactions.

~*^8. Hassle-Free Client Refunds^*~
Provide refunds to clients when needed, ensuring customer satisfaction and trust. Build a reputation for excellent customer service.

~*^9. Transform into a Super Online Business^*~
Embrace the future of e-commerce with UltimateDeAl and transform your business into a super online powerhouse. Benefit from the security and transparency of blockchain technology, ensuring your business remains open and operational without risk of closure.

~*^10. Fundraising Campaigns for Pre-Selling Shares^*~
Need to raise capital? We offer fundraising campaigns that allow you to pre-sell your shares. Just like Kickstarter helps startups get off the ground by securing early funds, our fundraising feature ensures you have the capital you need to scale. Creates auto locked liquidity after withdrawing funds.

~*^11. Payments For Workers^*~
Pay yourself and your workers before dividend distribution to keep the business profitable!
*5% Fee to us to maintain the website*

~*^12. Encrypt Hidden Files For Download^*~
Want your clients to get a file, video or content as a product? Our platform let you encrypt hidden files available to download or stream only to the client which purchased the item!

~*^What You Get by Being on Our Website:^*~

~Subdomain~ for your online shop.
~Encryption for all invoices~ to protect sensitive information.
~Automated emails~ for seamless communication with your clients.
~Organized store page~ with a personalized subdomain.
~Detailed product pages~ to showcase your offerings.
~Customer reviews~ based on purchases to build trust.
~Technical support~ to assist you with any issues.
~Ability to buy or sell shares~ and see their price on the store page.
~Additional features~ to help your business grow.
~Admin dashboard~ for comprehensive management.
~Hidden files~ encrypted hidden files available only to your clients

*^Deploy ESH Token ~(Only Gas and 3% to us)~^*
~https://thirdweb.com/ultimatedeal.eth/ESH~

*^Deploy Invoice (Service Key) Minter ~(Only Gas)~^*
~https://thirdweb.com/ultimatedeal.eth/ESHInvoicesMinter~

*^Deploy ESHStore ~(OnlyGas and 5% to us)~^*
*For Rental Of Services*
~https://thirdweb.com/ultimatedeal.eth/ESHStoreRentals~
*For Sales Of Unlimited Time Services*
~https://thirdweb.com/ultimatedeal.eth/ESHStoreSales~

*^Deploy VotingSystem ~(Only Gas)~^*
~https://thirdweb.com/ultimatedeal.eth/ESHVoting~
`);


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
              const defaultSize = fontSizes[defaultFontSizeIndex-7];
      
              switch (style) {
                  case '~':
                      element = <span key={index} className={`!text-[#FFDD00] text-${defaultSize}`}>{element}</span>;
                      break;
                  case '*':
                      element = <strong key={index} className={`text-${defaultSize}`}>{element}</strong>;
                      break;
                  case '$':
                      element = <span key={index} className={`text-center block my-[10px] text-${defaultSize}`}>{element}</span>;
                      break;
                  case '^':
                      const fontSizeIndex = fontSizes.indexOf('sm') + 4;
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
            <div >
                {lines}
            </div>
        );
    }
    return (
        <div className="mx-auto linear-gradient1 rounded-[15px] w-full font-epilogue text-[#FFFFFF] p-5 touch-auto overflow-auto">
            {renderDescriptionWithBreaks(desc)}
            <a href='https://docs.google.com/document/d/e/2PACX-1vSeMz6005Tb2qpx46K6HxtrnKLMF96js_DXKewHivKLKcdu_nqgTXwdb4gzw6pi_dr81gFt1MrjKPAt/pub' className='text-cyan-400' target='_blank'>To White Paper</a>
            <img src={UltimateDealStartUp} className='w-11/12 rounded-[15px] mx-auto'></img>
        </div>
    )
}
export default ListingInfo;