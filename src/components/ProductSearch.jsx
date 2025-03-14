import { useState, useEffect } from 'react';
import { useContract } from '@thirdweb-dev/react';
import { Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import IPFSMediaViewer from './IPFSMediaViewer';

const ProductSearch = ({ contractAddress }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  
  const navigate = useNavigate();
  const { contract } = useContract(contractAddress);
  
  // Clean description text by removing special characters
  const cleanDescription = (text) => {
    return text.replace(/[~$^*]/g, '').trim();
  };

  // Handle product click and navigation
  const handleProductClick = (barcode) => {
    if(window.location.pathname.split('/')[3]=='products') {
      navigate(`/store/${window.location.pathname.split('/')[2]}/products/${barcode}`);
      setInputFocused(false);
      setSearchTerm('');
      return;
    }
    navigate(`products/${barcode}`);
    setInputFocused(false);
    setSearchTerm('');
  };

  function processDescription(description, maxLength = 170)
  
  {
    if (!description) {return ''};

    // Remove special formatting characters
    const cleanedDescription = description.replace(/[\$^~*]/g, '');

    // Truncate the description if it exceeds the maxLength
    if (cleanedDescription.length <= maxLength) {return cleanedDescription};
    return cleanedDescription.substring(0, maxLength) + '...';
};
function processtitle(description, maxLength = 50) {
  if (!description) {return ''};

  // Remove special formatting characters
  const cleanedDescription = description.replace(/[\$^~*]/g, '');

  // Truncate the description if it exceeds the maxLength
  if (cleanedDescription.length <= maxLength) {return cleanedDescription};
  return cleanedDescription.substring(0, maxLength) + '...';
};

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
        <div className="font-epilogue text-[#000001]">
            {lines}
        </div>
    );
}



  // Fetch all products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const barcodes = await contract.call('getAllProductsBarcodes');
        
        const productDetails = await Promise.all(
          barcodes.map(async (barcode) => {
            const product = await contract.call('products', [barcode]);
            const data = await contract.call('getProductPics',[barcode])
            return {
              name: product.name,
              description: await processDescription(cleanDescription(product.productDescription,100)),
              price: product.price,
              barcode: barcode,
              bill: data,
              quantity: product.quantity,
              discount: product.discountPercentage
            };
          })
        );
        
        setProducts(productDetails);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (contract) {
      fetchProducts();
    }
  }, [contract]);

  // Filter products based on search term
  useEffect(() => {
    const searchLower = searchTerm.toLowerCase();
    const filtered = products.filter(
      product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  return (
    <div className="w-full max-w-xl mx-auto relative">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setTimeout(() => setInputFocused(false), 200)}
          placeholder="Search products..."
          className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-[#b8b8b8]" />
        {isLoading && (
          <Loader2 className="absolute right-3 top-2.5 h-5 w-5 text-[#b8b8b8] animate-spin" />
        )}
      </div>

      {inputFocused && searchTerm && (
        <div className="absolute z-[11] w-full mt-1 bg-white rounded-lg shadow-lg border touch-auto">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div 
                key={product.barcode}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex"
                onClick={() => handleProductClick(product.barcode)}
              > <div>
                <div className='flex'><IPFSMediaViewer
                ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${product.bill[1]}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                className='!h-[100px] !w-[100px] !flex'/>
                </div>
                <div>
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-[#b8b8b8] truncate w-6/10">
                  {renderDescriptionWithBreaks(product.description)}
                </div>
                <div className="text-sm mt-1">
                  <span className="text-red-600">
                    Full Price: {product.price*1e-6.toString()} USDT
                  </span>
                  <span className="text-green-600 ml-[15px]">
                     Now: {product.price/100*(100-product.discount)*1e-6.toString()} USDT
                  </span>
                  <span className="ml-3 text-[#b8b8b8]">
                    Stock: {product.quantity.toString()}
                  </span>
                </div>
                </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-[#b8b8b8]">
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;