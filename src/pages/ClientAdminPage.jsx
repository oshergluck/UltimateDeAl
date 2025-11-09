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
import { PinataSDK } from "pinata";

const ClientAdminPage = () => {
const [isUploadingImages, setIsUploadingImages] = useState([false]);
const [imageUploadProgress, setImageUploadProgress] = useState([0]);
  const pinata = new PinataSDK({
    pinataJwt: import.meta.env.VITE_PINATA_JWT,
    pinataGateway: "bronze-sticky-guanaco-654.mypinata.cloud",
  });
    const client = createThirdwebClient({clientId:import.meta.env.VITE_THIRDWEB_CLIENT})
    const { mutate: sendTransaction, isPending } = useSendTransaction();
    const [userPass,setUserPass] = useState('');
    const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT;
    const POLYRPC = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`
    const POLYRPC1 = 'https://base-mainnet.g.alchemy.com/v2/d32cys2ito51Xt9AgfAUTBuIuQd-yQbm';
    const defaultFontSizeIndex = fontSizes.indexOf('sm');
    const defaultSize = fontSizes[defaultFontSizeIndex-2];
    const [amountForPayment, setAmountForPayment] = useState('');
    const [setstoring, setsetstoring] = useState('');
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
    const [contractPassword, setcontractPassword] = useState('');
    const { approveCoinsForSmartContractDeAl,address ,login,storeRegistery,encryptIPFS,encrypt,decrypt,HexToInteger,generateKey,formatDate,generateSecretKey,ethAddressToBinaryKey} = useStateContext();
    const [connectedto,setConnectedto] = useState(false);
    const [productCategory,setProductCategory] = useState('');
    const [receipts,setReceipts] = useState([]);
    const [hiddenIPFS,setHiddenIPFS] = useState('');
    const [type,setType] = useState('');
    const [inv,setInvoices] = useState();
    const [invoicesaddress,setinvoiceaddress] = useState('');
    const {contract:contract} = useContract(userContract);

      const [adminContract, setAdminContract] = useState(null);

      async function getInvoices(data) {
        const data2 = await contract.call('invoices');
        console.log(data);
        setinvoiceaddress(data);
              const theData = getContract({
                client:client,
                chain:{
                  id:8453,
                  rpc:POLYRPC,
                },
                address: data
              });
              setInvoices(theData);
      } 
      
useEffect(() => {

    if (userContract && ethers.utils.isAddress(userContract)) {
        const contract = getContract({
            client: client,
            chain: {
                id: 8453,
                rpc: POLYRPC,
            },
            address: userContract,
        });
        
        setAdminContract(contract);
        getInvoices();
          
    } else {
        setAdminContract(null);
    }
}, [userContract]);

      const Hidden = getContract({
        client:client,
        chain:{
          id:8453,
          rpc:POLYRPC,
        },
        address: '0xCe5d3258b6dCDE1D1cB133956839a3c8571D9A5b',
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
                const data2 = await contract.call('invoices');
                getInvoices(data2);
                setInvoices(data2);
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
            await waitWithTimeout(() => inv);
            const data = await login(userContract,userPass)
            setConnectedto(data);
        } catch (error) {
            alert('Contract setup timeout: Try again', error);
            // Retry logic can be added here
        } finally {
            setIsLoading(false);
        }
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
        await setcontractPassword(contractPassword);
        const encryptedName = encrypt(nameofworker,address,userContract);
        const encryptedEmail = encrypt(email,contractPassword,address,userContract);
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
            setResponseData("Profit Balance: ~" + HexToInteger(data._hex)/1e6 + ' USDC~');
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
            setResponseData("Total Deposited From Creation: ~"+HexToInteger(data._hex)/1e6 + '~ USDC');
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
                return `${reversedIndex.toString().padStart(2, '0')}: ${ethers.BigNumber.from(payment)} USDC`;
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
                    `Invoice Id `+receipt[0],  // Assuming fields 0, 1, 2 do not need decryption
                    formatDate(receipt[1]*1000),
                    receipt[2],
                    receipt[5],  // Assuming fields 5, 6, 7 do not need decryption
                    receipt[6] / 1e6, // Decrypt field at index 8
                ];
    
                // Calculate reverse index for display purposes
                const reversedIndex = totalReceipts - index - 1;
                return `${decryptedReceipt.join(', ')}`;
            });
    
            // Join formatted receipts with double newlines to separate them
            const formattedString = formattedReceipts.join('~\n\n~');
    
            // Update UI or state with formatted data
            setResponseData(`All Invoices:\n~${formattedString}~`);
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
            setcontractPassword('');
            const data = await contract.call('receipts',[indexOfReceipt]);
            const moreData = await contract.call('infos',[indexOfReceipt]);
            const formattedData = await {  
                rId: data[0],
                time: data[1],
                wallet: data[2],
                name: await decrypt(data[3],contractPassword,data[2],userContract,userPass),
                email: await decrypt(data[4],contractPassword,data[2],userContract,userPass),
                poductbarcode: data[5],
                amountpayed: ethers.BigNumber.from(data[6].toString())/1e6.toString(),
                pysicaladdress: await decrypt(data[7],contractPassword,data[2],userContract,userPass),
                phone: await decrypt(data[8],contractPassword,data[2],userContract,userPass),
            };
                const data2 = await contract.call('contractOwner');
                await setContractOwner(data2);
                if(formattedData) {
                    await setResponseData(`Receipt ID: ~${formattedData.rId}~\nTime: ~${formatDate(formattedData.time*1000)}~\nWallet: ~${data[2]}~\nName: ~${address.toLowerCase()==data2.toLowerCase() ? (await formattedData.name):('')}~\nEmail: ~${address.toLowerCase()==data2.toLowerCase() ? (await formattedData.email):('You are not the contractOwner!')}~\nProduct Barcode: ~${formattedData.poductbarcode}~\nAmount Payed: ~${formattedData.amountpayed} USDC~\nAddress: ~${address.toLowerCase()==data2.toLowerCase() ? (await formattedData.pysicaladdress):('')}~\nPhone: ~${address.toLowerCase()==data2.toLowerCase() ? (await formattedData.phone):('')}~\n ${address.toLowerCase()==data2.toLowerCase() ? ('') : ('')}`);
            setIsLoading(false);
                }
            
            return await formattedData;
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    const getAllDecryptedEmails = async () => {
      try {
          setIsLoading(true);
          
          // Fetch client addresses and encrypted emails
          const encryptedEmails = await contract.call("getAllClientsEmails");
  
          // Create decryption promises without async/await in map
          const decryptionPromises = encryptedEmails.map(email => 
              decrypt(
                  email,
                  contractPassword,
                  "0xfb311Eb413a49389a2078284B57C8BEFeF6aFF67",
                  userContract,
                  userPass
              ).catch(() => '') // Return empty string on decryption failure
          );
          
          // Wait for all promises to settle
          const decryptedEmails = await Promise.all(decryptionPromises);
          
          // Convert to comma-separated string
          const emailString = decryptedEmails.join(", ");
          if(address==contractOwner) {
            setResponseData(emailString);
          }
          else setResponseData("Your'e not the contractOwner");
          return emailString;
          
      } catch (error) {
          console.error("Process failed:", error);
          alert("Failed to fetch or decrypt emails");
          setResponseData(emailString); // Set empty response on critical failure
          return "";
      } finally {
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
              name: await decrypt(receipt[3],contractPassword,receipt[2],userContract,userPass),
              email: await decrypt(receipt[4],contractPassword,receipt[2],userContract,userPass),
              poductbarcode: receipt[5],
              amountpayed: (ethers.BigNumber.from(receipt[6].toString()) / 1e6).toString(),
              pysicaladdress: await decrypt(receipt[7],contractPassword,receipt[2],userContract,userPass),
              phone: await decrypt(receipt[8],contractPassword,receipt[2],userContract,userPass),
            };
            const data2 = await contract.call('contractOwner');
      
            formattedReceipts += `\n\n\nReceipt ID: ${formattedData.rId}\nTime: ${formatDate(formattedData.time*1000)}\nWallet: ${formattedData.wallet}\nName: ${address.toLowerCase()==data2.toLowerCase() ? (formattedData.name):("Your'e not the Contract Owner")}\nEmail: ${address.toLowerCase()==data2.toLowerCase() ? (formattedData.email):("Your'e not the Contract Owner")}\nProduct Barcode: ${formattedData.poductbarcode}\nAmount Payed: ~${formattedData.amountpayed} USDC~\nAddress: ${address.toLowerCase()==data2.toLowerCase() ? (formattedData.pysicaladdress):("Your'e not the Contract Owner")}\nPhone: ${address.toLowerCase()==data2.toLowerCase() ? (formattedData.phone):("Your'e not the Contract Owner")}\n\n\n\n\n`;
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

            await setcontractPassword('');
            const data = await contract.call('getClientDetails', [customerAddress]);
            const data1 = await contract.call('contractOwner');
            const formattedData = await {
                name: data[1],
                email: data[3],
                phone: data[2],
                physicalAddress: data[4],
                wallet: data[0],
            };
            
            const tst = await decrypt(formattedData.name,contractPassword,formattedData.wallet,userContract,userPass)


            await setResponseData(`Name: ${data1.toLowerCase() == address.toLowerCase() ? (`~`+await decrypt(formattedData.name,contractPassword,formattedData.wallet,userContract,userPass)+`~`):('')}\nEmail: ${data1.toLowerCase() == address.toLowerCase() ? (`~`+await decrypt(formattedData.email,contractPassword,formattedData.wallet,userContract,userPass)+`~`):('')}\nPhysical Address: ${address.toLowerCase() == data1.toLowerCase() ? (`~`+await decrypt(formattedData.physicalAddress,contractPassword,formattedData.wallet,userContract,userPass)+`~`):('')}\nPhone: ${data1.toLowerCase() == address.toLowerCase() ? (`~`+await decrypt(formattedData.phone,contractPassword,formattedData.wallet,userContract,userPass)+`~`):('')}\nWallet: ${`~`+formattedData.wallet+`~`}`);
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

    const handleContinueDistributeProfit = async () => {
      try { setIsLoading(true);
      const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
      const gasPrice = await provider.getGasPrice();
      const transaction =await prepareContractCall({
          contract:adminContract,
          method: "function continueDistribution(bytes32 distributionId, uint256 maxCalls) returns (bool)",
          params: [distId, maxCall],
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
        const transaction =await prepareContractCall({
            contract:adminContract,
            method: "function finalizeDistribution(bytes32 distributionId) nonReentrant onlyOwner public returns(bool)",
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

    const handleImageUpload = async (index, file) => {
      if (!file) return;
    
      const newUploadingStates = [...isUploadingImages];
      const newProgressStates = [...imageUploadProgress];
      
      newUploadingStates[index] = true;
      newProgressStates[index] = 0;
      
      setIsUploadingImages(newUploadingStates);
      setImageUploadProgress(newProgressStates);
    
      try {
        const upload = await pinata.upload.file(file, {
          onProgress: (progress) => {
            const percent = Math.round((progress.bytes / progress.totalBytes) * 100);
            newProgressStates[index] = percent;
            setImageUploadProgress([...newProgressStates]);
          }
        });
    
        // Update the specific image at index with the CID
        const newImages = [...images];
        newImages[index] = upload.IpfsHash;
        setImages(newImages);
    
        console.log(`Image ${index + 1} uploaded to IPFS:`, upload.IpfsHash);
      } catch (error) {
        console.error(`Error uploading image ${index + 1}:`, error);
        alert(`Failed to upload image ${index + 1}. Please try again.`);
      } finally {
        newUploadingStates[index] = false;
        newProgressStates[index] = 0;
        setIsUploadingImages(newUploadingStates);
        setImageUploadProgress(newProgressStates);
      }
    };
    
    const handleRemoveImage = (index) => {
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
    };
    
    const handleAddImage = () => {
      setImages([...images, '']);
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
            setcontractPassword('');
            const data = await contract.call('workers', [workerIndex]);
            // Convert BigNumber to numerical value
            const formattedData = await {
                email: await decrypt(data[0],contractPassword),
                address: data[1],
                name: await decrypt(data[2],contractPassword),
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
        <div className="min-h-screen linear-gradient1 text-gray-100 p-2 sm:p-4 md:p-6">
  <div className="max-w-7xl mx-auto bg-slate-800/50 rounded-xl shadow-2xl backdrop-blur-sm border border-slate-700 overflow-hidden">
    {isLoading && (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-t-4 border-yellow-500"></div>
      </div>
    )}
    
    {/* Header */}
    <header className="p-4 sm:p-6 border-b border-slate-700">
      <h1 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent mb-2">
        Company Administration Dashboard
      </h1>
    </header>
    
    {/* Status Banners */}
    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
      <div className="p-3 sm:p-4 rounded-lg bg-yellow-500/90 text-black font-medium shadow-md">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-sm sm:text-base">Press once on every button. Transactions may take up to 30 seconds to process.</p>
        </div>
      </div>
      
      <div className="p-3 sm:p-4 rounded-lg bg-slate-700 shadow-md border border-slate-600">
        <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-yellow-500 mr-2"></div>
            <span>Gas Required</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 mr-2"></div>
            <span>Free Operation</span>
          </div>
        </div>
      </div>
    </div>
    
    {connectedto ? (
      <div className="p-3 sm:p-4">
        {receipts ? (
          <div className="space-y-4 sm:space-y-6">
            <SalesDashboard receipts={receipts} style={'mx-auto'} />
            <div className="bg-slate-800 rounded-lg shadow-md p-3 sm:p-4 border border-slate-700">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 text-yellow-400">Response Data</h2>
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-yellow-400 p-3 sm:p-4 rounded-lg border border-slate-700 min-h-[40px] text-xs sm:text-sm overflow-auto max-h-[150px] sm:max-h-[200px]">
                {renderDescriptionWithBreaks(responseData)}
              </div>
            </div>
          </div>
        ) : null}
        
        {/* Main Dashboard Section */}
        <div className="space-y-6 sm:space-y-8 mt-4 sm:mt-6">
           {/* Invoice Management Section */}
           <section className="bg-slate-800 rounded-lg shadow-md p-4 sm:p-5 border border-slate-700">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-yellow-400 border-b border-slate-700 pb-2">Invoice Management</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <button onClick={getAllReceipts} className="px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
                Get All Invoices
              </button>
              <button onClick={getAllDecryptedEmails} className="px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
                Get All Emails
              </button>
              
              <input type="number" placeholder="Invoice ID" value={indexOfReceipt} onChange={e => setIndexOfReceipt(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
              <button onClick={getReceipt} className="px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
                Get Invoice By ID
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <input type="text" placeholder="Customer Wallet" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
              <button onClick={getReceiptsByAddress} className="px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
                Get Client Invoices
              </button>
              <button onClick={() => HandleRefund(customerAddress, indexOfReceipt)} className="px-3 sm:px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
                Refund By Invoice ID
              </button>
            </div>
            
            <button onClick={() => getClientDetails(customerAddress)} className="px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
              Get Client Details
            </button>
          </section>
          {/* Financial Operations Section */}
          <section className="bg-slate-800 rounded-lg shadow-md p-4 sm:p-5 border border-slate-700">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-yellow-400 border-b border-slate-700 pb-2">Financial Operations</h2>
            
            {/* Profit and Dividends */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-medium text-gray-200">Profit Distribution</h3>
                <div className="flex gap-2">
                  <button onClick={handleDistributeProfit} className="flex-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200 flex items-center justify-center text-sm sm:text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">Distribute</span> Dividends
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Dividend %" value={dividend} onChange={e => setDividend(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                  <input type="text" placeholder="Max Calls" value={maxCall} onChange={e => setMaxCall(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                </div>
                <div className="flex gap-2">
                <input type="text" placeholder="Dist. ID" value={distId} onChange={e => setDistId(e.target.value)} className="flex-1 p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-xs sm:text-sm" />
                <div>
                <TransactionButton
                  className={"!flex-1 !px-2 !sm:px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200 !text-xs !sm:text-sm"}
                  transaction={async () => {
                    const tx = prepareContractCall({
                      contract: adminContract,
                      method: "function continueDistribution(bytes32 distributionId, uint256 maxCalls) returns (bool)",
                      params: [distId, maxCall],
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
                  Continue Distribution
                </TransactionButton>
                </div>
                
                </div>
                <div>
                  <TransactionButton
                  className={"!px-2 !sm:px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200 !text-xs !sm:text-sm"}
                  transaction={async () => {
                    const tx = prepareContractCall({
                      contract: adminContract,
                      method : "function finalizeDistribution(bytes32 distributionId) public returns(bool)",
                      params: [distId],
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
                  Finish Distribution
                </TransactionButton>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-medium text-gray-200">Profit Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handleProfit} className="px-2 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
                    Contract Profit
                  </button>
                  <button onClick={handleTotal} className="px-2 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
                    Total Profit
                  </button>
                </div>
              </div>
            </div>
            
            {/* Direct Payment */}
            <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-medium mb-2 text-gray-200">Direct Payment</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input type="text" placeholder="Wallet Address" value={workerAddress} onChange={e => setWorkerAddress(e.target.value)} className="flex-1 p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                <input type="number" placeholder="Amount" value={amountForPayment} onChange={e => setAmountForPayment(e.target.value)} className="flex-1 p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                <button onClick={handlePayment} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200 whitespace-nowrap text-sm sm:text-base">
                  Pay To
                </button>
              </div>
            </div>
            
            {/* USDC Operations */}
            <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-medium mb-2 text-gray-200">USDC Operations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                <input type="number" placeholder="Amount For Deposit" value={AmountForDeposit} onChange={e => setAmountForDeposit(e.target.value)} className="sm:col-span-2 p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                <TransactionButton
                  className={"!px-3 !sm:px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200 !text-sm"}
                  transaction={async () => {
                    const tx = prepareContractCall({
                      contract: adminContract,
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
                  Deposit USDC
                </TransactionButton>
              </div>
             
              <TransactionButton
                className={"!w-full !px-3 !sm:px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200 !text-sm"}
                transaction={async () => {
                  const tx = prepareContractCall({
                    contract: PaymentContract,
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
                Approve $USDC For Deposit
              </TransactionButton>
            </div>
          </section>
          
          {/* Product Management Section */}
          <section className="bg-slate-800 rounded-lg shadow-md p-4 sm:p-5 border border-slate-700">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-yellow-400 border-b border-slate-700 pb-2">Product Management</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <input type="text" placeholder="Barcode" value={productBarcode} onChange={e => setProductBarcode(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
              <button onClick={() => LoadProduct(productBarcode)} className="px-3 sm:px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Load Product
              </button>
              <input type="text" placeholder="Product Name" value={productName} onChange={e => setProductName(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
              <input type="text" placeholder="Category" value={productCategory} onChange={e => setProductCategory(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <input type="number" placeholder={type == 'Sales' ? "Price in USDC" : "Price Per Day in USDC"} value={productPrice} onChange={e => setProductPrice(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Quantity" value={produtQuantity} onChange={e => setProdutQuantity(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                <input type="number" placeholder="Discount %" value={productDiscount} onChange={e => setProductDiscount(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
              </div>
            </div>
            
            <div className="mb-4">
              <textarea value={productDescription} onChange={e => setProductDescription(e.target.value)} rows="6" placeholder="Product description..." className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white resize-none text-sm" />
            </div>
            
            {/* Product Images */}
            {showImageInputs && (
  <div className="mb-4 space-y-2">
    {/* Image Upload Inputs */}
    {images.map((image, index) => (
      <div key={index} className="mb-4 p-4 border border-gray-600 rounded-lg bg-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium">
            Product Image {index + 1}
          </span>
          {isUploadingImages[index] && (
            <span className="text-yellow-400 text-sm">
              Uploading... {imageUploadProgress[index]}%
            </span>
          )}
          {!isUploadingImages[index] && image && (
            <span className="text-green-400 text-sm">✓ Uploaded</span>
          )}
        </div>

        {/* File Input */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(index, e.target.files[0])}
          disabled={isUploadingImages[index]}
          className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
        />

        {/* Upload Progress Bar */}
        {isUploadingImages[index] && (
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${imageUploadProgress[index]}%` }}
            ></div>
          </div>
        )}

        {/* Display CID if uploaded */}
        {!isUploadingImages[index] && image && (
          <div className="text-green-400 text-sm break-all mt-2">
            CID: {image}
          </div>
        )}

        {/* Remove Image Button */}
        {image && (
          <button
            onClick={() => handleRemoveImage(index)}
            className="mt-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200 text-xs"
          >
            Remove Image
          </button>
        )}
      </div>
    ))}

    {/* Add Product Image Button */}
    <button
      onClick={handleAddImage}
      className="px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm"
    >
      Add Product Image
    </button>
  </div>
)}
            
            {/* Product Action Buttons */}
            
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
              <TransactionButton
                className={`!py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200 !text-xs !sm:text-sm`}
                transaction={async() => {
                  if(type=='Rentals') {
                    const newPrice = await Math.round((productPrice*1e6));
                    const imagesArray = images.filter(img => img !== '');
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
                    const tx = prepareContractCall({
                      contract:adminContract,
                      method: "function addProduct(string _name, string _barcode, uint256 _priceInNormalNumber, uint256 _quantity, string[] _productImages, string _productDescription, uint256 _discountPercentage, string _category)", 
                      params: [productName, productBarcode, newPrice, produtQuantity, imagesArray, productDescription, productDiscount, productCategory],
                    });
                    return tx;
                  }
                  else if (type=='Sales') {
                    const imagesArray = images.filter(img => img !== '');
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
                className={`!px-2 !sm:px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200 !text-xs !sm:text-sm`}
                transaction={async () => {
                  if(type=='Renting') {
                    const newPrice = await Math.round((productPrice*1e6));
                    const imagesArray = images.filter(img => img !== '');
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
                    const tx = prepareContractCall({
                      contract:adminContract,
                      method: "function editProduct(string _barcode, string _name, uint256 _priceInNormalNumber, string[] _productImages, string _productDescription, string _category)",
                      params: [productBarcode, productName, newPrice, imagesArray, productDescription, productCategory],
                    });
                    return tx;
                  }
                  else if (type=='Sales') {
                    const imagesArray = images.filter(img => img !== '');
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
              <button onClick={updateProductQuantity} className="px-2 sm:px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
                Update Quantity
              </button>
              <button onClick={changeProductDiscount} className="px-2 sm:px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm">
                Update Discount
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                <input type="text" placeholder="Store Contract" value={setstoring} onChange={e => setsetstoring(e.target.value)} className="sm:col-span-2 p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                <TransactionButton
                  className={"!px-3 !sm:px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200 !text-sm"}
                  transaction={async () => {
                    const tx = prepareContractCall({
                      contract: inv,
                      method: "function setStore(address _ERCUltraStore)",
                      params: [setstoring]
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
                  SetStore
                </TransactionButton>
              </div>
            {/* Hidden Media Section */}
            <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4 mb-4">
              <h3 className="text-base sm:text-lg font-medium mb-3 text-gray-200">Hidden Media Management</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <input type="text" placeholder="Product Barcode" value={productBarcode} onChange={e => setProductBarcode(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                <input type="text" placeholder="Shop URL" value={shopURL} onChange={e => setShopURL(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
                <input type="text" placeholder="Media Hash CID" value={hiddenIPFS} onChange={e => setHiddenIPFS(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <TransactionButton
                  className={"!px-2 !sm:px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200 !text-xs !sm:text-sm"}
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
                  className={"!px-2 !sm:px-4 !py-2 !bg-yellow-500 !hover:bg-yellow-600 !text-black !font-medium !rounded-lg !transition-colors !duration-200 !text-xs !sm:text-sm"}
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
          
         
          
          {/* Admin Settings Section */}
          <section className="bg-slate-800 rounded-lg shadow-md p-4 sm:p-5 border border-slate-700">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-yellow-400 border-b border-slate-700 pb-2">Admin Settings</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" placeholder="New Owner Address" value={newOwner} onChange={e => setNewOwner(e.target.value)} className="p-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm" />
              <button onClick={handleChangeOwner} className="px-3 sm:px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors duration-200 text-xs sm:text-sm flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Change Owner
              </button>
            </div>
          </section>
        </div>
      </div>
    ) : (
      <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[60vh] p-3 sm:p-4">
        <div className="w-full max-w-sm sm:max-w-md p-5 sm:p-8 bg-slate-800 rounded-lg shadow-md border border-slate-700">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-yellow-400 mb-4 sm:mb-6">Admin Login</h2>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Contract Address</label>
              <input
                type="text"
                placeholder="Enter contract address"
                value={userContract}
                onChange={e => setUserContract(e.target.value)}
                className="w-full p-2 sm:p-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={userPass}
                onChange={e => setUserPass(e.target.value)}
                className="w-full p-2 sm:p-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm"
              />
            </div>
            <button
              onClick={() => SettingAContract(userContract)}
              disabled={!userContract}
              className="w-full mt-2 px-4 py-2 sm:py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-800 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center text-sm sm:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
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
