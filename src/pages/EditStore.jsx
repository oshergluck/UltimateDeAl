import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PinataSDK } from "pinata";
import { useStateContext } from '../context';
import { CustomButton, FormField, Loader,IPFSMediaViewer  } from '../components';

const EditStore = () => {
  const navigate = useNavigate();
  const pinata = new PinataSDK({
    pinataJwt: import.meta.env.VITE_PINATA_JWT,
    pinataGateway: "bronze-sticky-guanaco-654.mypinata.cloud",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { editStoreDetails, storeRegistery } = useStateContext();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadProgress, setLogoUploadProgress] = useState(0);
  const [selectedLogoFile, setSelectedLogoFile] = useState(null);

  // OPTIONAL: banner upload (remove if you don’t use banner)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerUploadProgress, setBannerUploadProgress] = useState(0);
  const [selectedBannerFile, setSelectedBannerFile] = useState(null);

  const isValidCID = (hash) => {
    if (!hash) return false;
    // Basic CIDv0/v1 check (good enough for UI)
    return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash) || /^bafy[a-zA-Z0-9]{20,}$/.test(hash);
  };

  const UploadAnimation = ({ progress, isUploading, file, cid, typeLabel }) => (
    <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between">
        <div className="text-white font-semibold">{typeLabel} Upload</div>
        {isUploading ? (
          <div className="text-blue-200 text-sm font-bold">Uploading... {progress}%</div>
        ) : cid ? (
          <div className="text-green-300 text-sm font-bold">✓ Uploaded</div>
        ) : (
          <div className="text-white/50 text-sm">No file yet</div>
        )}
      </div>

      {file && <div className="mt-2 text-white/60 text-sm">File: {file.name}</div>}

      {isUploading && (
        <div className="mt-3 w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-300 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {!isUploading && cid && (
        <div className="mt-3 text-xs text-white/70 break-all">
          CID: <span className="text-blue-200">{cid}</span>
        </div>
      )}
    </div>
  );

  const handleLogoUpload = async (file) => {
    if (!file) return;
    setIsUploadingLogo(true);
    setLogoUploadProgress(0);
    setSelectedLogoFile(file);

    try {
      const upload = await pinata.upload.file(file, {
        onProgress: (progress) => {
          const percent = Math.round((progress.bytes / progress.totalBytes) * 100);
          setLogoUploadProgress(percent);
        },
      });

      setForm((prev) => ({ ...prev, _picture: upload.IpfsHash }));
    } catch (e) {
      console.error("Logo upload failed:", e);
      alert("Failed to upload logo. Please try again.");
    } finally {
      setIsUploadingLogo(false);
      setLogoUploadProgress(0);
    }
  };

  // OPTIONAL: banner upload (remove if you don’t use banner)
  const handleBannerUpload = async (file) => {
    if (!file) return;
    setIsUploadingBanner(true);
    setBannerUploadProgress(0);
    setSelectedBannerFile(file);

    try {
      const upload = await pinata.upload.file(file, {
        onProgress: (progress) => {
          const percent = Math.round((progress.bytes / progress.totalBytes) * 100);
          setBannerUploadProgress(percent);
        },
      });

      setForm((prev) => ({ ...prev, _banner: upload.IpfsHash })); // <- requires form._banner
    } catch (e) {
      console.error("Banner upload failed:", e);
      alert("Failed to upload banner. Please try again.");
    } finally {
      setIsUploadingBanner(false);
      setBannerUploadProgress(0);
    }
  };
  const [form, setForm] = useState({
    _urlPath: '',
    _smartContractAddress: '',
    _picture: '',
    _name: '',
    _description: '',
    _category: '',
    _contactInfo: '',
    _storeOwner: '',
    _city: ''
  });

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  const fetchStore = async (urlPath) => {
    try {
      const data = await storeRegistery.call('getStoreByURLPath', [urlPath]);
      const data2 = await storeRegistery.call('getStoreVotingSystem',[urlPath]);
      
      // Update all fields at once with a single setForm call
      setForm(prevForm => ({
        ...prevForm,
        _category: data.category,
        _smartContractAddress: data.smartContractAddress,
        _picture: data.picture,
        _name: data.name,
        _description: data.description,
        _contactInfo: data.contactInfo,
        _storeOwner: data2.storeOwner,
        _city: data2.city
      }));
    } catch (error) {
      console.error('Error fetching store:', error);
      alert('Error fetching store details. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (await editStoreDetails({ ...form })) {
      setIsLoading(false);
    } else {
      alert('Provide all the fields correctly.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[820px] px-3 sm:px-0 mt-10">
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-blue-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="p-4 sm:p-8">
        {isLoading && <Loader />}

        <div>
          <h1 className="text-white font-extrabold tracking-tight text-2xl sm:text-3xl">
            Edit Store
          </h1>
          <p className="text-white/60 text-sm sm:text-base mt-1">
            Upload a new logo/banner to IPFS or paste a CID manually.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* URL + Load */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1">
                <FormField
                  labelName="URL Path *"
                  placeholder="Your exact subdomain"
                  inputType="text"
                  value={form._urlPath}
                  handleChange={(e) => handleFormFieldChange("_urlPath", e)}
                />
              </div>

              <button
                type="button"
                onClick={() => fetchStore(form._urlPath)}
                className="w-full sm:w-auto rounded-2xl px-6 py-3 font-extrabold shadow-lg transition
                           bg-white text-blue-700 hover:shadow-xl hover:opacity-95
                           disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !form._urlPath}
              >
                Load
              </button>
            </div>
          </div>

          {/* Core fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
              <FormField
                labelName="Store Owner *"
                placeholder="Store Owner Address"
                inputType="text"
                value={form._storeOwner}
                handleChange={(e) => handleFormFieldChange("_storeOwner", e)}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
              <FormField
                labelName="City"
                placeholder="City"
                inputType="text"
                value={form._city}
                handleChange={(e) => handleFormFieldChange("_city", e)}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
              <FormField
                labelName="Store Name *"
                placeholder="Store Name"
                inputType="text"
                value={form._name}
                handleChange={(e) => handleFormFieldChange("_name", e)}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
              <FormField
                labelName="Category *"
                placeholder="Category"
                inputType="text"
                value={form._category}
                handleChange={(e) => handleFormFieldChange("_category", e)}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5 md:col-span-2">
              <FormField
                labelName="Description *"
                placeholder="Description"
                isTextArea
                value={form._description}
                handleChange={(e) => handleFormFieldChange("_description", e)}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5 md:col-span-2">
              <FormField
                labelName="Email *"
                placeholder="Email"
                inputType="text"
                value={form._contactInfo}
                handleChange={(e) => handleFormFieldChange("_contactInfo", e)}
              />
            </div>
          </div>

          {/* Logo upload + CID */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-white font-bold text-lg">Store Logo</div>
                <div className="text-white/60 text-sm">
                  Upload an image or paste an IPFS CID.
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Upload */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Upload Logo (recommended 1:1)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                  className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                             file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={isUploadingLogo}
                />
                <UploadAnimation
                  progress={logoUploadProgress}
                  isUploading={isUploadingLogo}
                  file={selectedLogoFile}
                  cid={form._picture}
                  typeLabel="Logo"
                />
              </div>

              {/* Manual CID + Preview */}
              <div>
                <FormField
                  labelName="Logo CID (IPFS) *"
                  placeholder="bafy... / Qm..."
                  inputType="text"
                  value={form._picture}
                  handleChange={(e) => handleFormFieldChange("_picture", e)}
                />

                <div className="mt-3 rounded-2xl overflow-hidden border border-white/10 bg-black/30">
                  {isValidCID(form._picture) ? (
                    <IPFSMediaViewer
                      ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${form._picture}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                      className="w-full h-[220px] object-cover"
                    />
                  ) : (
                    <div className="h-[220px] flex items-center justify-center text-white/50 text-sm">
                      Upload or paste a valid CID to preview
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* OPTIONAL: Banner upload section (remove if you don’t use banner) */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
            <div className="text-white font-bold text-lg">Store Banner (Optional)</div>
            <div className="text-white/60 text-sm">Upload a wide banner image (recommended 3:1).</div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Upload Banner</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleBannerUpload(e.target.files?.[0])}
                  className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                             file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={isUploadingBanner}
                />
                <UploadAnimation
                  progress={bannerUploadProgress}
                  isUploading={isUploadingBanner}
                  file={selectedBannerFile}
                  cid={form._banner}
                  typeLabel="Banner"
                />
              </div>

              <div>
                <FormField
                  labelName="Banner CID (IPFS)"
                  placeholder="bafy... / Qm..."
                  inputType="text"
                  value={form._banner || ""}
                  handleChange={(e) => handleFormFieldChange("_banner", e)}
                />

                <div className="mt-3 rounded-2xl overflow-hidden border border-white/10 bg-black/30">
                  {isValidCID(form._banner) ? (
                    <IPFSMediaViewer
                      ipfsLink={`https://bronze-sticky-guanaco-654.mypinata.cloud/ipfs/${form._banner}?pinataGatewayToken=${import.meta.env.VITE_PINATA_API}`}
                      className="w-full h-[220px] object-cover"
                    />
                  ) : (
                    <div className="h-[220px] flex items-center justify-center text-white/50 text-sm">
                      Optional: upload/paste CID to preview banner
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs sm:text-sm text-white/50">
              Make sure the CIDs are correct before saving.
            </div>

            <button
              type="submit"
              disabled={isLoading || !form._urlPath || !form._storeOwner || !form._name || !form._description || !form._category || !form._contactInfo || !isValidCID(form._picture)}
              className="w-full sm:w-auto rounded-2xl px-8 py-4 font-extrabold shadow-lg transition
                         bg-gradient-to-r from-blue-500 to-cyan-300 text-black
                         hover:opacity-95 hover:shadow-xl
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Edit Store"}
            </button>
          </div>

          {!isValidCID(form._picture) && form._picture?.length > 0 && (
            <div className="text-red-300 text-sm">
              Invalid Logo CID. Please upload again or paste a valid IPFS CID.
            </div>
          )}
        </form>
      </div>
    </div>
  </div>

  );
};

export default EditStore;