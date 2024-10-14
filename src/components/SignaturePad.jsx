import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignaturePad = () => {
    const signaturePadRef = useRef(null);
    const [signature, setSignature] = useState(null);

    // Function to clear the signature
    const clearSignature = () => {
        signaturePadRef.current.clear();
    };

    // Function to save the signature as an image
    const saveSignature = () => {
        if (!signaturePadRef.current.isEmpty()) {
            const signatureData = signaturePadRef.current.getTrimmedCanvas().toDataURL('image/png');
            setSignature(signatureData); // Save signature data to state or send to server
            console.log(signatureData);
        } else {
            alert("Please provide a signature.");
        }
    };

    return (
        <div className="flex flex-col items-center space-y-6 bg-gray-50 p-6 rounded-lg shadow-lg w-[100%] max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-700">נא לחתום למטה</h2>

            {/* Signature Canvas */}
            <div className="border-2 border-gray-400 rounded-lg overflow-hidden w-full">
                <SignatureCanvas
                    ref={signaturePadRef}
                    penColor="black"
                    canvasProps={{
                        width: 300,
                        height: 100,
                        className: 'signature-canvas bg-white'
                    }}
                />
            </div>

            {/* Buttons */}
            <div className="flex space-x-4">
                <button
                    onClick={clearSignature}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold  px-4 rounded-lg transition duration-200"
                >
                    Clear
                </button>
                <button
                    onClick={saveSignature}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold  px-4 rounded-lg transition duration-200"
                >
                    Save Signature
                </button>
            </div>

            {/* Display Saved Signature */}
            {signature && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-700">החתימה שלך:</h3>
                    <img
                        src={signature}
                        alt="User signature"
                        className="border border-gray-300 rounded-lg mt-2"
                    />
                </div>
            )}
        </div>
    );
};

export default SignaturePad;
