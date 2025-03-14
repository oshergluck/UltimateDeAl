import React, { useState } from 'react';
import { useStateContext } from '../context';
import { Loader,CustomButton } from '../components';
import { Base} from "@thirdweb-dev/chains";
import { ethers } from 'ethers';
import { useContract } from '@thirdweb-dev/react';
import { fontSizes } from '../components/AccessibilityMenu';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import {createThirdwebClient,prepareContractCall, getContract } from "thirdweb";
import { useSendTransaction,TransactionButton } from 'thirdweb/react';
import { format, addDays } from 'date-fns';


const ClientAdminPage = () => {
    const client = createThirdwebClient({clientId:import.meta.env.VITE_THIRDWEB_CLIENT})
    const { mutate: sendTransaction, isPending } = useSendTransaction();
    const ThirdWEBAPI = import.meta.env.VITE_THIRDWEB_CLIENT;
    const POLYRPC1 = `https://8453.rpc.thirdweb.com/${ThirdWEBAPI}`
    const POLYRPC = 'https://base-mainnet.g.alchemy.com/v2/d32cys2ito51Xt9AgfAUTBuIuQd-yQbm';
    const defaultFontSizeIndex = fontSizes.indexOf('sm');
    const defaultSize = fontSizes[defaultFontSizeIndex-2];
    const [amountForPayment, setAmountForPayment] = useState('');
    const [workerAddress, setWorkerAddress] = useState('');
    const [workerIndex, setWorkerIndex] = useState('');
    const [productName, setProductName] = useState('');
    const [indexOfReceipt, setIndexOfReceipt] = useState('');
    const [productBarcode, setProductBarcode] = useState('');
    const [produtQuantity, setProdutQuantity] = useState('');
    const [productPrice, setProductPrice] = useState();
    const [productDiscount, setProductDiscount] = useState('');
    const [images, setImages] = useState([]);
    const [showImageInputs, setShowImageInputs] = useState(true);
    const [productDescription, setProductDescription] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [nameofworker, setNameOfWorker] = useState('');
    const [email, setEmail] = useState('');
    const [AmountForDeposit, setAmountForDeposit] = useState('');
    const [newOwner, setNewOwner] = useState('');
    const [amount, setAmount] = useState(1);
    const [userContract, setUserContract] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [responseData, setResponseData] = useState('');
    const [userSecretKey, setUserSecretKey] = useState('');
    const { approveCoinsForSmartContractUSDT ,encrypt,decryptData,HexToInteger,formatDate} = useStateContext();
    const [connectedto,setConnectedto] = useState(false);
    const [productCategory,setProductCategory] = useState('');
    const [specialDiscountAddresses, setSpecialDiscountAddresses] = useState(['']);
    const [specialDiscountPercentages, setSpecialDiscountPercentages] = useState(['']);
    const [specialBarcodes, setSpecialParcodes] = useState(['']);

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
                      element = <span key={index} className={`!text-[#00FFFF] text-${defaultSize}`}>{element}</span>;
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

    const handleAddSpecialDiscount = () => {
        setSpecialDiscountAddresses(prev => [...prev, '']);
        setSpecialDiscountBarcodes(prev => [...prev, '']);
        setSpecialDiscountPercentages(prev => [...prev, '']);
      };
      
      const handleSpecialDiscountAddressChange = (index, value) => {
        setSpecialDiscountAddresses(prev => {
          const newAddresses = [...prev];
          newAddresses[index] = value;
          return newAddresses;
        });
      };
      
      const handleSpecialDiscountPercentageChange = (index, value) => {
        setSpecialDiscountPercentages(prev => {
          const newPercentages = [...prev];
          newPercentages[index] = value;
          return newPercentages;
        });
      };

      const handleSpecialDiscountBarcodes = (index, value) => {
        setSpecialParcodes(prev => {
          const newBarcodes = [...prev];
          newBarcodes[index] = value;
          return newBarcodes;
        });
      };

    const SettingAContract = async () => {
            setIsLoading(true);
            await setUserContract(userContract);
            await new Promise(resolve => {
                setTimeout(() => {
                  resolve(); // Resolve the promise after the setTimeout delay
                }, 2000);
              });
              if(userSecretKey.length!==88) {
                setIsLoading(false);
                alert('Wrong Password');
                return
              }
            setIsLoading(false);
            setConnectedto(true);
    };

    const {contract:contract} = useContract(userContract);

    const adminContract = getContract({
        client:client,
        chain:{
          id:8453,
          rpc:POLYRPC,
        },
        address: userContract,
      });

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
            setAmount(amount*1e18);
            try {
            const provider = new ethers.providers.JsonRpcProvider(POLYRPC, Base);
            const gasPrice = await provider.getGasPrice();
            await approveCoinsForSmartContractUSDT(amount, userContract);
            console.log("contract call success");
            }
            catch (error) {
                alert(error);
            }
    };

    const handleAddWorker = async () => {
        try {
        setUserSecretKey(userSecretKey);
        const encryptedName = encrypt(nameofworker,userSecretKey);
        const encryptedEmail = encrypt(email,userSecretKey);
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
            setResponseData("Profit Balance: " + HexToInteger(data._hex)/1e12 + ' In your payment token');
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
            setResponseData("Total Deposited From Creation: "+HexToInteger(data._hex)/1e12 + ' DAI');
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
                return `${reversedIndex.toString().padStart(2, '0')}: ${ethers.BigNumber.from(payment)} DAI`;
            });
    
            setResponseData(`Worker ${workerIndex} Payments:\n${formattedPayments.join('\n')}`);
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
          console.log(imagesArray);
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
            setUserSecretKey(userSecretKey);
    
            const receipts = await contract.call('getAllReceipts');
            const totalReceipts = receipts.length;
    
            const formattedReceipts = receipts.map((receipt, index) => {
                // Decrypt specific fields in the receipt array
                const decryptedReceipt = [
                    receipt[0],  // Assuming fields 0, 1, 2 do not need decryption
                    Date(receipt[1]),
                    receipt[2],
                    decryptData(receipt[3], userSecretKey),  // Decrypt field at index 3
                    decryptData(receipt[4], userSecretKey),  // Decrypt field at index 4
                    receipt[5],  // Assuming fields 5, 6, 7 do not need decryption
                    receipt[6] / 1e18,
                    decryptData(receipt[7], userSecretKey),
                    decryptData(receipt[8], userSecretKey)   // Decrypt field at index 8
                ];
    
                // Calculate reverse index for display purposes
                const reversedIndex = totalReceipts - index - 1;
                return `${reversedIndex.toString().padStart(2, '0')}: ${decryptedReceipt.join(', ')}`;
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
            const data = await contract.call('receipts',[indexOfReceipt]);
            const formattedData = {  
                rId: data[0],
                time: data[1],
                wallet: data[2],
                name: decryptData(data[3],userSecretKey).toString(),
                email: decryptData(data[4],userSecretKey).toString(),
                poductbarcode: data[5],
                amountpayed: ethers.BigNumber.from(data[6].toString())/1e18.toString(),
                pysicaladdress: decryptData(data[7],userSecretKey).toString(),
                phone: decryptData(data[8],userSecretKey).toString(),
            };
            setResponseData(`Receipt ID: ${formattedData.rId}\nTime: ${formatDate(formattedData.time*1000)}\nWallet: ${formattedData.wallet}\nName: ${formattedData.name}\nEmail: ${formattedData.email}\nProduct Barcode: ${formattedData.poductbarcode}\nAmount Payed: ${formattedData.amountpayed}\nAddress: ${formattedData.pysicaladdress}\nPhone: ${formattedData.phone}`);
            setIsLoading(false);
            return formattedData;
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
            const formattedData = {
              rId: receipt[0],
              time: receipt[1],
              wallet: receipt[2],
              name: decryptData(receipt[3],userSecretKey),
              email: decryptData(receipt[4],userSecretKey),
              poductbarcode: receipt[5],
              amountpayed: (ethers.BigNumber.from(receipt[6].toString()) / 1e18).toString(),
              pysicaladdress: decryptData(receipt[7],userSecretKey),
              phone: decryptData(receipt[8],userSecretKey),
            };
      
            formattedReceipts += `Receipt ID: ${formattedData.rId}\nTime: ${formatDate(formattedData.time*1000)}\nWallet: ${formattedData.wallet}\nName: ${formattedData.name}\nEmail: ${formattedData.email}\nProduct Barcode: ${formattedData.poductbarcode}\nAmount Payed: ${formattedData.amountpayed}\nAddress: ${formattedData.pysicaladdress}\nPhone: ${formattedData.phone}\n\n`;
          }
      
          setResponseData(formattedReceipts);
          setIsLoading(false);
        } catch (error) {
          alert(error);
          setIsLoading(false);
        }
      };

    const getClientDetails = async (customerAddress) => {
        try {
            setIsLoading(true);
            clearResponseData();
            setCustomerAddress(customerAddress);
            
            const data = await contract.call('getClientDetails', [customerAddress]);
            
            const formattedData = {
                name: data[1],
                email: data[3],
                phone: data[2],
                physicalAddress: data[4],
                wallet: data[0],
            };


            setResponseData(`Name: ${decryptData(formattedData.name,userSecretKey)}\nEmail: ${decryptData(formattedData.email,userSecretKey)}\nPhysical Address: ${decryptData(formattedData.physicalAddress,userSecretKey)}\nPhone: ${decryptData(formattedData.phone,userSecretKey)}\nWallet: ${formattedData.wallet}`);
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
            params: [AmountForDeposit*1e18],
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

        const transaction = prepareContractCall({
            contract:adminContract,
            method: "function distributeQuarterlyBalance()",
            params: [],
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
            setUserSecretKey(userSecretKey);
            const data = await contract.call('workers', [workerIndex]);
            // Convert BigNumber to numerical value
            const formattedData = {
                email: decryptData(data[0],userSecretKey),
                address: data[1],
                name: decryptData(data[2],userSecretKey),
                index: convertBigNumber(data[3])
            };
            console.log(formattedData);
            setResponseData(String('Email: '+formattedData.email + ' Wallet: ' + formattedData.address + ' Name: ' + formattedData.name + ' Index: ' + formattedData.index));
            setIsLoading(false);
            return formattedData;
        }
        catch (error) {
            alert(error);
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            {isLoading && <Loader />}
            <h1 className="text-center text-4xl font-bold text-yellow-500 drop-shadow-md underline mb-8">Administrate Your Company</h1>
            <div className="my-4 p-4 rounded-[3px] bg-red-500 text-[#000000] font-semibold text-center">
                <p>Must have a permission, don't even try...</p>
            </div>
            <div className="my-4 p-4 rounded-[3px] bg-yellow-300 text-[#FFFFFF] font-semibold text-center">
                <p>For automated emails to your accountant, contact us.</p>
                <p>We Provide For You The Password To The Admin.</p>

            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <input
                    className="w-full md:w-1/2 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                    type="text"
                    placeholder="Address Of Code You Got From Us"
                    value={userContract}
                    onChange={e => setUserContract(e.target.value)}
                />
                <input
                    className="w-full md:w-1/2 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                    type="password"
                    placeholder="Password"
                    value={userSecretKey}
                    onChange={e => setUserSecretKey(e.target.value)}
                />
                <button
                    className={`bg-[#00FFFF] hover:bg-[#fc941c] w-full text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                    onClick={SettingAContract}
                    disabled={userContract==''||userSecretKey==''}
                >
                    Login To Dashboard
                </button>
            </div>
            {connectedto? (<>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <button
                    className={`bg-[#00FFFF] hover:bg-[#fc941c] w-full text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                    onClick={setAprrovalAmount}
                    disabled={userSecretKey=='' || userContract==''}
                >
                    Approve $DAI For Your Own Contract
                </button>
            </div>
            <div className="mb-8">
                <h2 className="text-xl text-[#FFFFF1] font-semibold mb-2">Worker Index</h2>
                <input
                    className="w-full md:w-1/4 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                    type="text"
                    placeholder="Worker Index"
                    value={workerIndex}
                    onChange={e => setWorkerIndex(e.target.value)}
                />
                <p className="text-sm text-[#FFFFFF] mt-1">This worker index is used for all functions that require a worker index.</p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <input
                    className="w-full md:w-1/3 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                    type="text"
                    placeholder="Wallet"
                    value={workerAddress}
                    onChange={e => setWorkerAddress(e.target.value)}
                />
                <input
                    className="w-full md:w-1/3 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                    type="text"
                    placeholder="Name"
                    value={nameofworker}
                    onChange={e => setNameOfWorker(e.target.value)}
                />
                <input
                    className="w-full md:w-1/3 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <button
                    className={`bg-[#00FFFF] w-full hover:bg-[#fc941c] text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                    onClick={handleAddWorker}
                    disabled={userSecretKey=='' || userContract==''}
                >
                    Add Worker
                </button>
                <button
                    className={`bg-green-500 w-full hover:bg-[#fc941c] text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                    onClick={handleGetWorker}
                    disabled={userSecretKey=='' || userContract==''}
                >
                    Get Worker
                </button>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <input
                    className="w-full md:w-1/2 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                    type="number"
                    placeholder="Amount For Payment"
                    value={amountForPayment}
                    onChange={e => setAmountForPayment(e.target.value)}
                />
                <button
                    className={`bg-red-500 w-full hover:bg-[#fc941c] text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                    onClick={handlePayForWorker}
                    disabled={userSecretKey=='' || userContract==''}
                >
                    Pay For Worker
                </button>
                <button
                    className={`bg-green-500 w-full hover:bg-[#fc941c] text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                    onClick={handleGetPaymentsOfWorker}
                    disabled={userSecretKey=='' || userContract==''}
                >
                    Get Worker Payments
                </button>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <input
                    className="w-full md:w-1/2 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                    type="number"
                    placeholder="Amount For Deposit"
                    value={AmountForDeposit}
                    onChange={e => setAmountForDeposit(e.target.value)}
                />
                <button
                    className={`bg-red-500 w-full hover:bg-[#fc941c] text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                    onClick={handleDepostMoney}
                    disabled={userSecretKey=='' || userContract==''}
                >
                    Deposit Money
                </button>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <input
                    className="w-full md:w-1/2 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                    type="text"
                    placeholder="New Owner Address"
                    value={newOwner}
                    onChange={e => setNewOwner(e.target.value)}
                />
                <button
                    className={`bg-red-500 w-full hover:bg-[#fc941c] text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                    onClick={handleChangeOwner}
                    disabled={userSecretKey=='' || userContract==''}
                >
                    Change Owner
                </button>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <button
                    className={`bg-red-500 w-full hover:bg-[#fc941c] text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                    onClick={handleDistributeProfit}
                    disabled={userSecretKey=='' || userContract==''}
                >
                    Withdraw
                </button>
                <button
                    className={`bg-[#00FFFF] w-full hover:bg-[#fc941c] text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                    onClick={handleProfit}
                    disabled={userSecretKey=='' || userContract==''}
                >
                    Amount Of Profit In The Contract
                </button>
                <button
                    className={`bg-green-500 w-full hover:bg-[#fc941c] text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                    onClick={handleTotal}
                    disabled={userSecretKey=='' || userContract==''}
                >
                    Amount Of Total Profit From The Begining
                </button>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <button
                    className={`bg-red-500 w-full hover:bg-[#fc941c] text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                    onClick={getAllReceipts}
                    disabled={userSecretKey=='' || userContract==''}
                >
                    Get All Receipts
                </button>
                <input
                    className="w-full md:w-1/2 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                    type="number"
                    placeholder="Receipt Index"
                    value={indexOfReceipt}
                    onChange={(e) => setIndexOfReceipt(e.target.value)}
                    />
                <button
                    className={`bg-[#00FFFF] w-full hover:bg-[#fc941c] text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                    onClick={getReceipt}
                    disabled={userSecretKey=='' || userContract==''}
                >
                    Get Receipt
                </button>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <input
                    className="w-full md:w-1/2 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                    type="text"
                    placeholder="Customer Wallet"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    />
                <button
                    className={`bg-red-500 w-full hover:bg-[#fc941c] text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                    onClick={getReceiptsByAddress}
                    disabled={userSecretKey=='' || userContract==''}
                >
                    Get All Receipts By Client Address
                </button>
                <button
                    className={`bg-red-500 w-full hover:bg-[#fc941c] text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                    onClick={() => HandleRefund(customerAddress,indexOfReceipt)}
                    disabled={userSecretKey=='' || userContract==''}
                >
                    Refund Client
                </button>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <button
                    className={`bg-green-500 w-full hover:bg-[#fc941c] text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                    onClick={() => getClientDetails(customerAddress)}
                    disabled={userSecretKey=='' || userContract==''}
                >
                    Get Client Details
                </button>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <input
                    className="w-full md:w-1/3 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                    type="text"
                    placeholder="Product Name"
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                />
                <input
                    className="w-full md:w-1/4 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                    type="text"
                    placeholder="Category"
                    value={productCategory}
                    onChange={e => setProductCategory(e.target.value)}
                />
                <input
                    className="w-full md:w-1/4 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                    type="text"
                    placeholder="Barcode"
                    value={productBarcode}
                    onChange={e => setProductBarcode(e.target.value)}
                />
                <input
                    className="w-full md:w-1/4 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                    type="number"
                    placeholder="Price In USD"
                    value={productPrice}
                    onChange={e => setProductPrice(e.target.value)}
                />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <input
                    className="w-full md:w-1/4 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                    type="number"
                    placeholder="Quantity"
                    value={produtQuantity}
                    onChange={e => setProdutQuantity(e.target.value)}
                />
                <input
                    className="w-full md:w-1/3 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                    type="number"
                    placeholder="Discount in %"
                    value={productDiscount}
                    onChange={e => setProductDiscount(e.target.value)}
                />
            </div>
            <div className="mb-8">
            <textarea
                    value={productDescription}
                    onChange={e => setProductDescription(e.target.value)}
                    rows="4" // Number of rows (height of the textarea)
                    cols="50" // Number of columns (width of the textarea)
                    placeholder="Enter product description here..." 
                    className="w-full h-[340px] p-2 rounded-[3px] border border-gray-300 !bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                />
            </div>
            <div className='mb-8'>
            {showImageInputs && (
                <div className="space-y-2">
                {images.map((image, index) => (
                    <input
                    key={index}
                    type="text"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder={`Image CID ${index + 1}`}
                    className="w-full p-2 border rounded"
                    />
                ))}
                <CustomButton
                    btnType="button"
                    title="Add Product Image"
                    styles="bg-green-500 text-white px-8 py-2 rounded"
                    handleClick={handleAddImage}
                />
                </div>
            )}
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                <TransactionButton
                className={`bg-red-500 w-full hover:bg-[#fc941c] text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                disabled = {userSecretKey=='' || userContract==''}
                transaction={() => {
                    const imagesArray = images.filter(img => img !== '');
                    // Create a transaction object and return it
                    const tx = prepareContractCall({
                    contract:adminContract,
                    method: "function addProduct(string _name, string _barcode, uint256 _priceInNormalNumber, uint256 _quantity, string[] _productImages, string _productDescription, uint256 _discountPercentage, string _category)", 
                    params: [productName, productBarcode, productPrice, produtQuantity, imagesArray, productDescription, productDiscount, productCategory],
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
                Add Product
                </TransactionButton>
                <TransactionButton
                className={`!bg-[#00FFFF] w-full hover:bg-[#fc941c] text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                disabled = {userSecretKey=='' || userContract==''}
                transaction={() => {
                    console.log(productPrice);
                    const imagesArray = images.filter(img => img !== '');
                    // Create a transaction object and return it
                    const tx = prepareContractCall({
                    contract:adminContract,
                    method: "function editProduct(string _barcode, string _name, uint256 _priceInNormalNumber, string[] _productImages, string _productDescription)",
                    params: [productBarcode, productName, productPrice*1e18, imagesArray, productDescription],
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
                Edit Product
                </TransactionButton>
                <button
                    className={`bg-green-500 w-full hover:bg-[#fc941c] text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                    onClick={updateProductQuantity}
                    disabled={userSecretKey=='' || userContract==''}
                >
                    Update Product Quantity
                </button>
                <button
                    className={`bg-yellow-500 w-full hover:bg-[#fc941c] text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                    onClick={changeProductDiscount}
                    disabled={userSecretKey=='' || userContract==''}
                >
                    Change Product Discount
                </button>
            </div>
            <div className="mb-2">
                <h2 className="text-xl font-semibold mb-2">Special Discounts</h2>
                {specialDiscountAddresses.map((address, index) => (
                    <div key={index} className="flex flex-col md:flex-row items-center gap-4 mb-4">
                    <input
                        className="w-full md:w-1/3 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                        type="text"
                        placeholder="Client Wallet Address"
                        value={specialDiscountAddresses[index]}
                        onChange={(e) => handleSpecialDiscountAddressChange(index, e.target.value)}
                    />
                    <input
                        className="w-full md:w-1/3 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                        type="number"
                        placeholder="Discount Percentage"
                        value={specialDiscountPercentages[index]}
                        onChange={(e) => handleSpecialDiscountPercentageChange(index, e.target.value)}
                    />
                    <input
                        className="w-full md:w-1/3 p-2 rounded-[3px] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00FFFF]"
                        type="number"
                        placeholder="Product Barcode"
                        value={specialBarcodes[index]}
                        onChange={(e) => handleSpecialDiscountBarcodes(index, e.target.value)}
                    />
                    </div>
                ))}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                    <CustomButton
                    btnType="button"
                    title="Add Special Discount"
                    styles="bg-green-500 text-white px-8 py-2 rounded"
                    handleClick={handleAddSpecialDiscount}
                    />
                    <TransactionButton
                        className={`!bg-[#00FFFF] w-full hover:bg-[#fc941c] text-[#000000] font-semibold py-2 px-4 rounded-[3px] shadow-md transition-colors duration-300 ease-in-out ${userSecretKey=='' || userContract=='' ? ' opacity-50 cursor-not-allowed !hover:opacity-50' : 'hover:opacity-100'}`}
                        disabled = {userSecretKey=='' || userContract==''}
                        transaction={() => {
                            const validAddresses = specialDiscountAddresses.filter(addr => ethers.utils.isAddress(addr));
                            const validPercentages = specialDiscountPercentages
                            .filter((_, index) => ethers.utils.isAddress(specialDiscountAddresses[index]))
                            .map(p => parseInt(p));
                            const validBarcodes = specialBarcodes;
                            console.log(productPrice);
                            // Create a transaction object and return it
                            const tx = prepareContractCall({
                            contract:adminContract,
                            method: "function addMultipleSpecialDiscounts(address[] memory _addresses, string[] memory _barcodes, uint256[] memory _discountPercentages)",
                            params: [validAddresses,validBarcodes, validPercentages],
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
                        Approve Special Discount
                    </TransactionButton>
                </div>
            </div>
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Response Data</h2>
                <div className={`bg-[#000000] text-[#00FFFF] text-[12px] font-bold p-4 rounded-[3px] min-h-[40px]`}>
                    {renderDescriptionWithBreaks(responseData)}
                </div>
            </div></>):(<></>)}
            
        </div>
    );
}

export default ClientAdminPage;
