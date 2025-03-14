import React, { useState ,useEffect} from 'react';
import { useStateContext } from '../context';
import { Loader,CustomButton,SalesDashboard } from '../components';
import { Base} from "@thirdweb-dev/chains";
import { ethers } from 'ethers';
import { ContractOwner, useContract } from '@thirdweb-dev/react';
import { fontSizes } from '../components/AccessibilityMenu';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import {createThirdwebClient,prepareContractCall, getContract } from "thirdweb";
import { useSendTransaction,TransactionButton } from 'thirdweb/react';
import { format, addDays } from 'date-fns';


const ClientAdminPage = () => {
    const client = createThirdwebClient({clientId:import.meta.env.VITE_THIRDWEB_CLIENT})
    const { mutate: sendTransaction, isPending } = useSendTransaction();
    const [userPass,setUserPass] = useState('');
    const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT;
    const POLYRPC = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`
    const POLYRPC1 = 'https://base-mainnet.g.alchemy.com/v2/d32cys2ito51Xt9AgfAUTBuIuQd-yQbm';
    const defaultFontSizeIndex = fontSizes.indexOf('sm');
    const defaultSize = fontSizes[defaultFontSizeIndex-2];
    const [amountForPayment, setAmountForPayment] = useState('');
    const [distId,setDistId] = useState('');
    const [workerAddress, setWorkerAddress] = useState('');
    const [workerIndex, setWorkerIndex] = useState('');
    const [productName, setProductName] = useState('');
    const [dividend,setDividend] = useState('');
    const [maxCall,setMaxCall] = useState('');
    const [indexOfReceipt, setIndexOfReceipt] = useState('');
    const [productBarcode, setProductBarcode] = useState('');
    const [produtQuantity, setProdutQuantity] = useState('');
    const [productPrice, setProductPrice] = useState();
    const [productDiscount, setProductDiscount] = useState('');
    const [images, setImages] = useState(["",""]);
    const [contractOwner,setContractOwner] = useState('');
    const [showImageInputs, setShowImageInputs] = useState(true);
    const [productDescription, setProductDescription] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [nameofworker, setNameOfWorker] = useState('');
    const [email, setEmail] = useState('');
    const [shopURL,setShopURL] = useState('');
    const [AmountForDeposit, setAmountForDeposit] = useState('');
    const [newOwner, setNewOwner] = useState('');
    const [amount, setAmount] = useState('');
    const [userContract, setUserContract] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [responseData, setResponseData] = useState('');
    const [userSecretKey, setUserSecretKey] = useState('');
    const { approveCoinsForSmartContractDeAl,address ,login,storeRegistery,encryptIPFS,encrypt,decrypt,HexToInteger,generateKey,formatDate,generateSecretKey,ethAddressToBinaryKey} = useStateContext();
    const [connectedto,setConnectedto] = useState(false);
    const [productCategory,setProductCategory] = useState('');
    const [receipts,setReceipts] = useState([]);
    const [hiddenIPFS,setHiddenIPFS] = useState('');
    const [type,setType] = useState('');
    const {contract:contract} = useContract(userContract);

    const adminContract = getContract({
        client:client,
        chain:{
          id:8453,
          rpc:POLYRPC,
        },
        address: userContract,
      });

      const Hidden = getContract({
        client:client,
        chain:{
          id:8453,
          rpc:POLYRPC,
        },
        address: '0x3e148491A9132D47201626A7161e09ad897e5861',
      });

      
    const PaymentContract = getContract({
        client:client,
        chain:{
          id:8453,
          rpc:POLYRPC,
        },
        address: import.meta.env.VITE_DEAL_COIN_ADDRESS,
      });
    
    useEffect(() => {
        window.scrollTo(0, 0);
        const recognizeType = async () => {
            if (contract) {
                const data = await contract.call('typeOfContract');
                setType(data);
                const data1 = await contract.call('contractOwner');
                setContractOwner(data1);
            }
        };
        recognizeType();
    }, [contract]);
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

    const SettingAContract = async (userContract) => {
        setIsLoading(true);
        
        const waitWithTimeout = (checkFn, timeout = 8000) => {
            return Promise.race([
                new Promise(resolve => {
                    const check = setInterval(() => {
                        if (checkFn()) {
                            clearInterval(check);
                            resolve();
                        }
                    }, 100);
                }),
                new Promise((_, reject) => 
                    setTimeout(() => {
                        reject(new Error('Timeout'));
                    }, timeout)
                )
            ]);
        };
    
        try {
            await waitWithTimeout(() => adminContract);
            await waitWithTimeout(() => contract);
            await waitWithTimeout(() => getAllReceipts());
            const data = await login(userContract,userPass)
            setConnectedto(data);
        } catch (error) {
            alert('Contract setup timeout: Try again', error);
            // Retry logic can be added here
        } finally {
            setIsLoading(false);
        }
    };

      const handleAddImage = () => {
        setImages(prevImages => [...prevImages, '']);
      };

      const handleImageChange = (index, value) => {
        setImages(prevImages => {
          const newImages = [...prevImages];
          newImages[index] = value;
          return newImages;
        });
      };

    const clearResponseData = () => {
        setResponseData('');
    };

    const setAprrovalAmount = async () => {
            setAmount(amount*1e6);
            try {
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
            const gasPrice = await provider.getGasPrice();
            
            await approveCoinsForSmartContractDeAl(AmountForDeposit*1e6, userContract);
            }
            catch (error) {
                alert(error);
            }
    };

    const handleAddWorker = async () => {
        try {
        await setUserSecretKey(userSecretKey);
        const encryptedName = encrypt(nameofworker,address,userContract);
        const encryptedEmail = encrypt(email,userSecretKey,address,userContract);
        setIsLoading(true);
        const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
        const gasPrice = await provider.getGasPrice();

        const transaction = prepareContractCall({
            contract:adminContract,
            method: "function addWorker(string memory _email,address _walletAddress,string memory _name)",
            params: [encryptedEmail, workerAddress, encryptedName],
            value: 0,
            gasPrice: gasPrice,
          });
          sendTransaction(transaction);

        //const data = contract.call('addWorker', [encryptedEmail, workerAddress, encryptedName],{ gasPrice : gasPrice , gasLimit:500000000});
        setIsLoading(false);
        return true;
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const handlePayForWorker = async () => {
        try { setIsLoading(true);
        const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
        const gasPrice = await provider.getGasPrice();

        const transaction = prepareContractCall({
            contract:adminContract,
            method: "function payForWorker(uint256 _amountInNormalNumber, uint256 _indexOfWorker)",
            params: [amountForPayment, workerIndex],
            value: 0,
            gasPrice: gasPrice,
          });
          sendTransaction(transaction);

            //const data = await contract.call('payForWorker', [amountForPayment, workerIndex],{ gasPrice : gasPrice, gasLimit:500000000 });
            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const handleProfit = async () => {
        try {
            setIsLoading(true);
            const data = await contract.call('Balance');
            setResponseData("Profit Balance: " + HexToInteger(data._hex)/1e6 + ' USDT');
            setIsLoading(false);
            return data;
        } catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const handleTotal = async () => {
        try { setIsLoading(true);
            const data = await contract.call('total');
            setResponseData("Total Deposited From Creation: ~"+HexToInteger(data._hex)/1e6 + '~ USDT');
            setIsLoading(false);
            return data;
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const handleGetPaymentsOfWorker = async () => {
        try { setIsLoading(true);
            clearResponseData();
            const data = await contract.call('getWorkerPayments', [workerIndex]);
            const totalPayments = data.length;
            const formattedPayments = data.map((payment, index) => {
                const reversedIndex = totalPayments - index - 1;
                return `${reversedIndex.toString().padStart(2, '0')}: ${ethers.BigNumber.from(payment)} USDT`;
            });
    
            await setResponseData(`Worker ${workerIndex} Payments:\n${formattedPayments.join('\n')}`);
            setIsLoading(false);
            return formattedPayments;
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const addProduct = async () => {
        try { 
          setIsLoading(true);
          const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
          const gasPrice = await provider.getGasPrice();
          const imagesArray = await images.filter(img => img !== '');
          const transaction = prepareContractCall({
            contract: adminContract,
            method: "function addProduct(string _name, string _barcode, uint256 _priceInNormalNumber, uint256 _quantity, string[] _productImages, string _productDescription, uint256 _discountPercentage)",
            params: [productName, productBarcode, productPrice, produtQuantity, imagesArray, productDescription, productDiscount],
            value: 0,
            gasPrice: gasPrice,
          });
          sendTransaction(transaction);
      
          setIsLoading(false);
        }
        catch (error) {
          alert(error);
          setIsLoading(false);
        }
      };

      const editProduct = async () => {
        try { 
          setIsLoading(true);
          const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
          const gasPrice = await provider.getGasPrice();
          const imagesArray = await images.filter(img => img !== '');
          
          const transaction = prepareContractCall({
            contract: adminContract,
            method: "function editProduct(string _barcode, string _name, uint256 _priceInNormalNumber, string[] _productImages, string _productDescription)",
            params: [productBarcode, productName, productPrice, imagesArray, productDescription],
            value: 0,
            gasPrice: gasPrice,
          });
          sendTransaction(transaction);
      
          setIsLoading(false);
        }
        catch (error) {
          alert(error);
          setIsLoading(false);
        }
      };

    const updateProductQuantity = async () => {
        try { setIsLoading(true);
        const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
        const gasPrice = await provider.getGasPrice();

        const transaction = prepareContractCall({
            contract:adminContract,
            method: "function updateProductQuantity(string memory _barcode, uint256 _newQuantity)",
            params: [productBarcode,produtQuantity],
            value: 0,
            gasPrice: gasPrice,
          });
          sendTransaction(transaction);


            //const data = await contract.call('updateProductQuantity', [productBarcode,produtQuantity],{ gasPrice : gasPrice , gasLimit:500000000});
            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const changeProductDiscount = async () => {
        try { setIsLoading(true);
        const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
        const gasPrice = await provider.getGasPrice();


        const transaction = prepareContractCall({
            contract:adminContract,
            method: "function changeProductDiscount(string memory _barcode, uint256 _newDiscountPercentage)",
            params: [productBarcode,productDiscount],
            value: 0,
            gasPrice: gasPrice,
          });
          sendTransaction(transaction);

            //const data = await contract.call('changeProductDiscount', [productBarcode,productDiscount],{ gasPrice : gasPrice , gasLimit:500000000});
            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    
    const getAllReceipts = async () => {
        try {
            setIsLoading(true);
            clearResponseData();
    
            const receipts = await contract.call('getAllReceipts');
            setReceipts(receipts);
            const totalReceipts = receipts.length;
    
            const formattedReceipts = receipts.map((receipt, index) => {
                // Decrypt specific fields in the receipt array
                const decryptedReceipt = [
                    receipt[0],  // Assuming fields 0, 1, 2 do not need decryption
                    Date(receipt[1]),
                    receipt[2],
                    receipt[5],  // Assuming fields 5, 6, 7 do not need decryption
                    receipt[6] / 1e6, // Decrypt field at index 8
                ];
    
                // Calculate reverse index for display purposes
                const reversedIndex = totalReceipts - index - 1;
                return `${index.toString().padStart(2, '0')}: ${decryptedReceipt.join(', ')}`;
            });
    
            // Join formatted receipts with double newlines to separate them
            const formattedString = formattedReceipts.join('\n\n');
    
            // Update UI or state with formatted data
            setResponseData(`All Receipts:\n${formattedString}`);
            setIsLoading(false);
            return formattedReceipts;
        } catch (error) {
            alert(`Error retrieving receipts: ${error.message}`);
            setIsLoading(false);
        }
    };
    
    

    const getReceipt = async () => {
        try { setIsLoading(true);
            clearResponseData();
            setUserSecretKey('');
            const data = await contract.call('receipts',[indexOfReceipt]);
            const moreData = await contract.call('infos',[indexOfReceipt]);
            const formattedData = await {  
                rId: data[0],
                time: data[1],
                wallet: data[2],
                name: await decrypt(data[3],userSecretKey,data[2],userContract,userPass),
                email: await decrypt(data[4],userSecretKey,data[2],userContract,userPass),
                poductbarcode: data[5],
                amountpayed: ethers.BigNumber.from(data[6].toString())/1e6.toString(),
                pysicaladdress: await decrypt(data[7],userSecretKey,data[2],userContract,userPass),
                phone: await decrypt(data[8],userSecretKey,data[2],userContract,userPass),
            };
                const data2 = await contract.call('contractOwner');
                await setContractOwner(data);
                if(formattedData) {
                    await setResponseData(`Receipt ID: ${formattedData.rId}\nTime: ${formatDate(formattedData.time*1000)}\nWallet: ${data[2]}\nName: ${address.toLowerCase()==data2.toLowerCase() ? (await formattedData.name):('')}\nEmail: ${address.toLowerCase()==data2.toLowerCase() ? (await formattedData.email):('You are not the contractOwner!')}\nProduct Barcode: ${formattedData.poductbarcode}\nAmount Payed: ${formattedData.amountpayed}\nAddress: ${address.toLowerCase()==data2.toLowerCase() ? (await formattedData.pysicaladdress):('')}\nPhone: ${address.toLowerCase()==data2.toLowerCase() ? (await formattedData.phone):('')}\n ${address.toLowerCase()==data2.toLowerCase() ? ('') : ('')}`);
            setIsLoading(false);
                }
            
            return await formattedData;
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const getReceiptsByAddress = async () => {
        try {
          setIsLoading(true);
          clearResponseData();
          setCustomerAddress(customerAddress);
          const receipts = await contract.call('getAllReceiptsByWalletAddress', [customerAddress]);
      
          let formattedReceipts = '';
          for (let i = 0; i < receipts.length; i++) {
            const receipt = receipts[i];
            const formattedData = await {
              rId: receipt[0],
              time: receipt[1],
              wallet: receipt[2],
              name: await decrypt(receipt[3],userSecretKey,receipt[2],userContract,userPass),
              email: await decrypt(receipt[4],userSecretKey,receipt[2],userContract,userPass),
              poductbarcode: receipt[5],
              amountpayed: (ethers.BigNumber.from(receipt[6].toString()) / 1e6).toString(),
              pysicaladdress: await decrypt(receipt[7],userSecretKey,receipt[2],userContract,userPass),
              phone: await decrypt(receipt[8],userSecretKey,receipt[2],userContract,userPass),
            };
      
            formattedReceipts += `\n\n\nReceipt ID: ${formattedData.rId}\nTime: ${formatDate(formattedData.time*1000)}\nWallet: ${formattedData.wallet}\nName: ${formattedData.name}\nEmail: ${formattedData.email}\nProduct Barcode: ${formattedData.poductbarcode}\nAmount Payed: ${formattedData.amountpayed}\nAddress: ${formattedData.pysicaladdress}\nPhone: ${formattedData.phone}\n\n\n\n\n`;
          }
      
          await setResponseData(formattedReceipts);
          setIsLoading(false);
        } catch (error) {
          alert(error);
          setIsLoading(false);
        }
      };

      const LoadProduct = async (barcode) => {
        setIsLoading(true);
        try {
            const data = await contract.call('products', [barcode]);
        const images = await contract.call('getProductPics',[barcode]);
        const formattedData = await {
            name: data[0],
            barcode: data[1],
            price: data[2],
            quantity: data[3],
            description: data[4],
            discount: data[5],
            category: data[6],
            images: images
        };
            setProductCategory(formattedData.category);
            setProductDiscount(formattedData.discount);
            setProductDescription(formattedData.description);
            setProductName(formattedData.name);
            setProductPrice(formattedData.price*1e-6);
            setProdutQuantity(formattedData.quantity);
            alert('Must put again the CIDs, The last ones are in F12 at the console');
            console.log('CIDs: ' +formattedData.images);
            setImages(formattedData.images);
            setIsLoading(false);
        }
        catch(error) {
            console.log(error);
            setIsLoading(false);
        }
    }

    const getClientDetails = async (customerAddress) => {
        try {
            setIsLoading(true);
            clearResponseData();

            await setUserSecretKey('');
            const data = await contract.call('getClientDetails', [customerAddress]);
            const data1 = await contract.call('contractOwner');
            const formattedData = await {
                name: data[1],
                email: data[3],
                phone: data[2],
                physicalAddress: data[4],
                wallet: data[0],
            };
            
            const tst = await decrypt(formattedData.name,userSecretKey,formattedData.wallet,userContract,userPass)


            await setResponseData(`Name: ${data1.toLowerCase() == address.toLowerCase() ? (`~`+await decrypt(formattedData.name,userSecretKey,formattedData.wallet,userContract,userPass)+`~`):('')}\nEmail: ${data1.toLowerCase() == address.toLowerCase() ? (`~`+await decrypt(formattedData.email,userSecretKey,formattedData.wallet,userContract,userPass)+`~`):('')}\nPhysical Address: ${address.toLowerCase() == data1.toLowerCase() ? (`~`+await decrypt(formattedData.physicalAddress,userSecretKey,formattedData.wallet,userContract,userPass)+`~`):('')}\nPhone: ${data1.toLowerCase() == address.toLowerCase() ? (`~`+await decrypt(formattedData.phone,userSecretKey,formattedData.wallet,userContract,userPass)+`~`):('')}\nWallet: ${`~`+formattedData.wallet+`~`}`);
            setIsLoading(false);
            return formattedData;
        } catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    
    const handleDepostMoney = async () => {
        try { setIsLoading(true);
        const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
        const gasPrice = await provider.getGasPrice();

        const transaction = prepareContractCall({
            contract:adminContract,
            method: "function deposit(uint256 _amount)",
            params: [AmountForDeposit*1e6],
            value: 0,
            gasPrice: gasPrice,
          });
          sendTransaction(transaction);

            //const data = await contract.call('deposit', [AmountForDeposit*1e6],{ gasPrice : gasPrice , gasLimit:500000000});
            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const handleChangeOwner = async () => {
        try { setIsLoading(true);
        const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
        const gasPrice = await provider.getGasPrice();

        const transaction = prepareContractCall({
            contract:adminContract,
            method: "function changeOwner(address _newOwner) returns (bool)",
            params: [newOwner],
            value: 0,
            gasPrice: gasPrice,
          });
          sendTransaction(transaction);

            //const data = await contract.call('changeOwner', [newOwner],{ gasPrice : gasPrice , gasLimit:500000000});
            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const handleDistributeProfit = async () => {
        try { setIsLoading(true);
        const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
        const gasPrice = await provider.getGasPrice();
        if(dividend=='')
            {
                alert('Must Put a number in Dividend Precentage\nIf you dont want to share dividends put 0');
                setIsLoading(false);
                return;
            }
        const transaction =await prepareContractCall({
            contract:adminContract,
            method: "function distributeQuarterlyBalance(uint256 percentageToDistribute, uint256 maxCalls) returns (bool)",
            params: [dividend,maxCall],
            value: 0,
            gasPrice: gasPrice,
          });
          sendTransaction(transaction);
        //const data = await contract.call('distributeQuarterlyBalance',{ gasPrice : gasPrice , gasLimit:500000000});
            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const FInalyz = async () => {
        try { setIsLoading(true);
        const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
        const gasPrice = await provider.getGasPrice();
        if(dividend=='')
            {
                alert('Must Put a number in Dividend Precentage\nIf you dont want to share dividends put 0');
                setIsLoading(false);
                return;
            }
        const transaction =await prepareContractCall({
            contract:adminContract,
            method: "finalizeDistribution(bytes32 distributionId) returns (bool)",
            params: [distId],
            value: 0,
            gasPrice: gasPrice,
          });
          sendTransaction(transaction);
        //const data = await contract.call('distributeQuarterlyBalance',{ gasPrice : gasPrice , gasLimit:500000000});
            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const handlePayment = async () => {
        try { setIsLoading(true);
        const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
        const gasPrice = await provider.getGasPrice();
        const transaction = prepareContractCall({
            contract:adminContract,
            method: "function payWorkerAfterFeeFromStoreBalance(address worker, uint256 amount) returns (bool)",
            params: [workerAddress,amountForPayment*1e6],
            value: 0,
            gasPrice: gasPrice,
          });
          sendTransaction(transaction);
        //const data = await contract.call('distributeQuarterlyBalance',{ gasPrice : gasPrice , gasLimit:500000000});
            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };
    

    const HandleRefund = async (addressOfClient,ReceiptID) => {
        try { setIsLoading(true);
        const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
        const gasPrice = await provider.getGasPrice();

        const transaction = prepareContractCall({
            contract:adminContract,
            method: "function refundClient(address _client, uint256 _receiptId)",
            params: [addressOfClient,ReceiptID],
            value: 0,
            gasPrice: gasPrice,
          });
          sendTransaction(transaction);


        //const data = await contract.call('distributeQuarterlyBalance',{ gasPrice : gasPrice , gasLimit:500000000});
            setIsLoading(false);
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };



    const convertBigNumber = (bigNumberObj) => {
        return bigNumberObj.toNumber();
    };
    
    const handleGetWorker = async () => {
        try { setIsLoading(true);
            clearResponseData();
            setUserSecretKey('');
            const data = await contract.call('workers', [workerIndex]);
            // Convert BigNumber to numerical value
            const formattedData = await {
                email: await decrypt(data[0],userSecretKey),
                address: data[1],
                name: await decrypt(data[2],userSecretKey),
                index: convertBigNumber(data[3])
            };
            await setResponseData(String('Email: '+formattedData.email + ' Wallet: ' + formattedData.address + ' Name: ' + formattedData.name + ' Index: ' + formattedData.index));
            setIsLoading(false);
            return formattedData;
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 p-6">
        <div className="max-w-7xl mx-auto bg-slate-800/50 rounded-xl shadow-2xl backdrop-blur-sm border border-slate-700">
          {isLoading && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-500"></div>
            </div>
          )}
          
          {/* Header */}
          <header className="p-6 border-b border-slate-700">
            <h1 className="text-center text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent mb-2">
              Company Administration Dashboard
            </h1>
          </header>
          
          {/* Status Banners */}
          <div className="p-4 space-y-4">
            <div className="p-4 rounded-lg bg-yellow-500/90 text-black font-medium shadow-md">
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p>Press once on every button. Transactions may take up to 30 seconds to process.</p>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-slate-700 shadow-md border border-slate-600">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                  <span>Gas Required</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                  <span>Free Operation</span>
                </div>
              </div>
            </div>
          </div>
          
          {connectedto ? (
            <div className="p-4">
              {receipts ? (
                <div className="space-y-6">
                  <SalesDashboard receipts={receipts} style={'mx-auto'} />
                  <div className="bg-slate-800 rounded-lg shadow-md p-4 border border-slate-700">
                    <h2 className="text-xl font-semibold mb-2 text-yellow-400">Response Data</h2>
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-yellow-400 p-4 rounded-lg border border-slate-700 min-h-[40px] text-sm overflow-auto max-h-[200px]">
                      {renderDescriptionWithBreaks(responseData)}
                    </div>
                  </div>
                </div>
              ) : null}
              
              {/* Main Dashboard Section */}
              <div className="space-y-8 mt-6">
                {/* Financial Operations Section */}
                <section className="bg-slate-800 rounded-lg shadow-md p-5 border border-slate-700">
                  <h2 className="text-xl font-bold mb-4 text-yellow-400 border-b border-slate-700 pb-2">Financial Operations</h2>
                  
                  {/* Profit and Dividends */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium text-gray-200">Profit Distribution</h3>
                      <div className="flex gap-2">
                        <button onClick={handleDistributeProfit} className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                          </svg>
                          Distribute Dividends
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Dividend Percentage" value={dividend} onChange={e => setDividend(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white" />
                        <input type="text" placeholder="Max Calls" value={maxCall} onChange={e => setMaxCall(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium text-gray-200">Profit Status</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={handleProfit} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200 text-sm">
                          Contract Profit
                        </button>
                        <button onClick={handleTotal} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200 text-sm">
                          Total Historical Profit
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={FInalyz} className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200">
                          Finalize Distribution
                        </button>
                        <input type="text" placeholder="Distribution ID" value={distId} onChange={e => setDistId(e.target.value)} className="flex-1 p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Direct Payment */}
                  <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium mb-2 text-gray-200">Direct Payment</h3>
                    <div className="flex flex-col md:flex-row gap-2">
                      <input type="text" placeholder="Wallet Address" value={workerAddress} onChange={e => setWorkerAddress(e.target.value)} className="flex-1 p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white" />
                      <input type="number" placeholder="Amount" value={amountForPayment} onChange={e => setAmountForPayment(e.target.value)} className="flex-1 p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white" />
                      <button onClick={handlePayment} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200 whitespace-nowrap">
                        Pay To
                      </button>
                    </div>
                  </div>
                  
                  {/* USDT Operations */}
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2 text-gray-200">USDT Operations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                      <input type="number" placeholder="Amount For Deposit" value={AmountForDeposit} onChange={e => setAmountForDeposit(e.target.value)} className="col-span-2 p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white" />
                      <TransactionButton
    className={"!px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200"}
    transaction={async () => {
      const tx = prepareContractCall({
        contract:adminContract,
            method: "function deposit(uint256 _amount)",
            params: [AmountForDeposit*1e6]
      });
      return tx;    
    }}
    onTransactionSent={(result) => {
      console.log("Transaction submitted", result.transactionHash);
    }}
    onTransactionConfirmed={(receipt) => {
      console.log("Transaction confirmed", receipt.transactionHash);
    }}
    onError={(error) => {
      console.error("Transaction error", error);
    }}
  >
                    Deposit USDT
                </TransactionButton>
                    </div>
                    <TransactionButton
    className={"!w-full !px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200"}
    transaction={async () => {
      const tx = prepareContractCall({
        contract:PaymentContract,
        method: "function approve(address spender, uint256 value) returns (bool)", 
        params: [userContract, AmountForDeposit*1e6],
      });
      return tx;    
    }}
    onTransactionSent={(result) => {
      console.log("Transaction submitted", result.transactionHash);
    }}
    onTransactionConfirmed={(receipt) => {
      console.log("Transaction confirmed", receipt.transactionHash);
    }}
    onError={(error) => {
      console.error("Transaction error", error);
    }}
  >
                    Approve $USDT For Deposit
                </TransactionButton>
                  </div>
                </section>
                
                {/* Product Management Section */}
                <section className="bg-slate-800 rounded-lg shadow-md p-5 border border-slate-700">
                  <h2 className="text-xl font-bold mb-4 text-yellow-400 border-b border-slate-700 pb-2">Product Management</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                    <input type="text" placeholder="Barcode" value={productBarcode} onChange={e => setProductBarcode(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white" />
                    <button onClick={() => LoadProduct(productBarcode)} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Load Product
                    </button>
                    <input type="text" placeholder="Product Name" value={productName} onChange={e => setProductName(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white" />
                    <input type="text" placeholder="Category" value={productCategory} onChange={e => setProductCategory(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <input type="number" placeholder={type == 'Sales' ? "Price in USDT" : "Price Per Day in USDT"} value={productPrice} onChange={e => setProductPrice(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" placeholder="Quantity" value={produtQuantity} onChange={e => setProdutQuantity(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white" />
                      <input type="number" placeholder="Discount %" value={productDiscount} onChange={e => setProductDiscount(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white" />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <textarea value={productDescription} onChange={e => setProductDescription(e.target.value)} rows="4" placeholder="Product description..." className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white resize-none" />
                  </div>
                  
                  {/* Product Images */}
                  {showImageInputs && (
                    <div className="mb-4 space-y-2">
                      {images.map((image, index) => (
                        <input
                          key={index}
                          type="text"
                          value={image}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          placeholder={`Image CID ${index + 1}`}
                          className="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
                        />
                      ))}
                      <button onClick={handleAddImage} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200 text-sm">
                        Add Product Image
                      </button>
                    </div>
                  )}
                  
                  {/* Product Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
                    <TransactionButton
                className={`!px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200`}
                
                transaction={async() => {
                    if(type=='Rentals') {
                        const newPrice = await Math.round((productPrice*1e6));
                        const imagesArray = images.filter(img => img !== '');
                    // Create a transaction object and return it
                        const tx = prepareContractCall({
                        contract:adminContract,
                        method: "function addProduct(string _name, string _barcode, uint256 _priceInNormalNumber, uint256 _quantity, string[] _productImages, string _productDescription, uint256 _discountPercentage, string _category)", 
                        params: [productName, productBarcode, newPrice, produtQuantity, imagesArray, productDescription, productDiscount, productCategory],
                        });
                        return tx;
                    }

                    if(type=='Liquidity') {
                        const newPrice = await Math.round((productPrice*1e6));
                        const imagesArray = images.filter(img => img !== '');
                    // Create a transaction object and return it
                        const tx = prepareContractCall({
                        contract:adminContract,
                        method: "function addProduct(string _name, string _barcode, uint256 _priceInNormalNumber, uint256 _quantity, string[] _productImages, string _productDescription, uint256 _discountPercentage, string _category)", 
                        params: [productName, productBarcode, newPrice, produtQuantity, imagesArray, productDescription, productDiscount, productCategory],
                        });
                        return tx;
                    }

                    if(type=='Renting') {
                        const newPrice = await Math.round((productPrice*1e6));
                        const imagesArray = images.filter(img => img !== '');
                    // Create a transaction object and return it
                        const tx = prepareContractCall({
                        contract:adminContract,
                        method: "function addProduct(string _name, string _barcode, uint256 _priceInNormalNumber, uint256 _quantity, string[] _productImages, string _productDescription, uint256 _discountPercentage, string _category)", 
                        params: [productName, productBarcode, newPrice, produtQuantity, imagesArray, productDescription, productDiscount, productCategory],
                        });
                        return tx;
                    }
                    else if (type=='Sales') {
                        const imagesArray = images.filter(img => img !== '');
                    // Create a transaction object and return it
                        const tx = prepareContractCall({
                        contract:adminContract,
                        method: "function addProduct(string _name, string _barcode, uint256 _priceInNormalNumber, uint256 _quantity, string[] _productImages, string _productDescription, uint256 _discountPercentage, string _category)", 
                        params: [productName, productBarcode, productPrice*1e6, produtQuantity, imagesArray, productDescription, productDiscount, productCategory],
                        });
                        return tx;
                    }
                }}
                onTransactionSent={(result) => {
                    console.log("Transaction submitted", result.transactionHash);
                }}
                onTransactionConfirmed={(receipt) => {
                    console.log("Transaction confirmed", receipt.transactionHash);
                }}
                onError={(error) => {
                    console.error("Transaction error", error);
                }}
                >
                Add Product
                </TransactionButton>
                <TransactionButton
                className={`!px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200`}
                
                transaction={async () => {
                    if(type=='Renting') {
                        const newPrice = await Math.round((productPrice*1e6));
                        const imagesArray = images.filter(img => img !== '');
                    // Create a transaction object and return it
                        const tx = prepareContractCall({
                        contract:adminContract,
                        method: "function editProduct(string _barcode, string _name, uint256 _priceInNormalNumber, string[] _productImages, string _productDescription, string _category)",
                        params: [productBarcode, productName, newPrice, imagesArray, productDescription, productCategory],
                        });
                        return tx;
                    }
                    if(type=='Rentals') {
                        const newPrice = await Math.round((productPrice*1e6));
                        const imagesArray = images.filter(img => img !== '');
                    // Create a transaction object and return it
                        const tx = prepareContractCall({
                        contract:adminContract,
                        method: "function editProduct(string _barcode, string _name, uint256 _priceInNormalNumber, string[] _productImages, string _productDescription, string _category)",
                        params: [productBarcode, productName, newPrice, imagesArray, productDescription, productCategory],
                        });
                        return tx;
                    }
                    if(type=='Liquidity') {
                        const newPrice = await Math.round((productPrice*1e6));
                        const imagesArray = images.filter(img => img !== '');
                    // Create a transaction object and return it
                        const tx = prepareContractCall({
                        contract:adminContract,
                        method: "function editProduct(string _barcode, string _name, uint256 _priceInNormalNumber, string[] _productImages, string _productDescription, string _category)",
                        params: [productBarcode, productName, newPrice, imagesArray, productDescription, productCategory],
                        });
                        return tx;
                    }
                    else if (type=='Sales') {
                        const imagesArray = images.filter(img => img !== '');
                    // Create a transaction object and return it
                        const tx = prepareContractCall({
                        contract:adminContract,
                        method: "function editProduct(string _barcode, string _name, uint256 _priceInNormalNumber, string[] _productImages, string _productDescription, string _category)",
                        params: [productBarcode, productName, productPrice*1e6, imagesArray, productDescription, productCategory],
                        });
                        return tx;
                    }
                }}
                onTransactionSent={(result) => {
                    console.log("Transaction submitted", result.transactionHash);
                }}
                onTransactionConfirmed={(receipt) => {
                    console.log("Transaction confirmed", receipt.transactionHash);
                }}
                onError={(error) => {
                    console.error("Transaction error", error);
                }}
                >
                Edit Product
                </TransactionButton>
                    <button onClick={updateProductQuantity} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200">
                      Update Quantity
                    </button>
                    <button onClick={changeProductDiscount} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200">
                      Update Discount
                    </button>
                  </div>
                  
                  {/* Hidden Media Section */}
                  <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-medium mb-3 text-gray-200">Hidden Media Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <input type="text" placeholder="Product Barcode" value={productBarcode} onChange={e => setProductBarcode(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white" />
                      <input type="text" placeholder="Shop URL" value={shopURL} onChange={e => setShopURL(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white" />
                      <input type="text" placeholder="Media Hash CID" value={hiddenIPFS} onChange={e => setHiddenIPFS(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                    <TransactionButton
    className={"!px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200"}
    transaction={async () => {
        const encryptedIPFS = await encryptIPFS(hiddenIPFS); 
      const tx = prepareContractCall({
        contract:Hidden,
        method: "function uploadIPFS(string shopUrl, string ipfsHash, string productBarcode)", 
        params: [shopURL, encryptedIPFS,productBarcode],
      });
      return tx;    
    }}
    onTransactionSent={(result) => {
      console.log("Transaction submitted", result.transactionHash);
    }}
    onTransactionConfirmed={(receipt) => {
      console.log("Transaction confirmed", receipt.transactionHash);
    }}
    onError={(error) => {
      console.error("Transaction error", error);
    }}
  >
                    Upload Hidden Video
                </TransactionButton>
                      <TransactionButton
    className={"!px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200"}
    transaction={async () => {
        const encryptedIPFS = await encryptIPFS(hiddenIPFS); 
      const tx = prepareContractCall({
        contract:Hidden,
        method: "function editIPFS(string shopUrl, string newIpfsHash, string productBarcode)", 
        params: [shopURL, encryptedIPFS,productBarcode],
      });
      return tx;    
    }}
    onTransactionSent={(result) => {
      console.log("Transaction submitted", result.transactionHash);
    }}
    onTransactionConfirmed={(receipt) => {
      console.log("Transaction confirmed", receipt.transactionHash);
    }}
    onError={(error) => {
      console.error("Transaction error", error);
    }}
  >
                    Edit Hidden Video
                </TransactionButton>
                    </div>
                  </div>
                </section>
                
                {/* Invoice Management Section */}
                <section className="bg-slate-800 rounded-lg shadow-md p-5 border border-slate-700">
                  <h2 className="text-xl font-bold mb-4 text-yellow-400 border-b border-slate-700 pb-2">Invoice Management</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <button onClick={getAllReceipts} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200">
                      Get All Invoices
                    </button>
                    <input type="number" placeholder="Invoice ID" value={indexOfReceipt} onChange={e => setIndexOfReceipt(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white" />
                    <button onClick={getReceipt} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200">
                      Get Invoice By ID
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <input type="text" placeholder="Customer Wallet" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white" />
                    <button onClick={getReceiptsByAddress} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200">
                      Get Client Invoices
                    </button>
                    <button onClick={() => HandleRefund(customerAddress, indexOfReceipt)} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200">
                      Refund By Invoice ID
                    </button>
                  </div>
                  
                  <button onClick={() => getClientDetails(customerAddress)} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200">
                    Get Client Details
                  </button>
                </section>
                
                {/* Admin Settings Section */}
                <section className="bg-slate-800 rounded-lg shadow-md p-5 border border-slate-700">
                  <h2 className="text-xl font-bold mb-4 text-yellow-400 border-b border-slate-700 pb-2">Admin Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="text" placeholder="New Owner Address" value={newOwner} onChange={e => setNewOwner(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white" />
                    <button onClick={handleChangeOwner} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Change Owner
                    </button>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-full max-w-md p-8 bg-slate-800 rounded-lg shadow-md border border-slate-700">
                <h2 className="text-2xl font-bold text-center text-yellow-400 mb-6">Admin Login</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Contract Address</label>
                    <input
                      type="text"
                      placeholder="Enter contract address"
                      value={userContract}
                      onChange={e => setUserContract(e.target.value)}
                      className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={userPass}
                      onChange={e => setUserPass(e.target.value)}
                      className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
                    />
                  </div>
                  <button
                    onClick={() => SettingAContract(userContract)}
                    disabled={!userContract}
                    className="w-full mt-2 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-800 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Login
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
}

export default ClientAdminPage;
