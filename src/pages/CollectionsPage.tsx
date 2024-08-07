import { useLocation } from 'react-router-dom'; 
import { useState } from 'react'; 
import { faker } from '@faker-js/faker'; 
// import type { Collection } from '../types/types'; 
import CollectionList from '../components/collection/CollectionList'; 
import { useFetchCollectionsQuery, useAddCollectionMutation } from '../store';
import  CollectionModal  from '../components/collection/CollectionModal'; 
import Input from '../components/Input'; 
import Prompt from '../components/Prompt'; 

import {
    ref, 
    uploadBytes, 
    getDownloadURL
} from 'firebase/storage'; 
import { storage } from '../firebaseSetup'; 


export default function CollectionsPage() {    
    
    const [modalOpen, setModalOpen] = useState(false); 
    const [isSuccess, setIsSuccess] = useState(false); 
    
    const location = useLocation(); 
    const { userId } = location.state;

    const { data, isLoading, isError } = useFetchCollectionsQuery(userId); 
    const [addCollection, {isLoading: isAdding}] = useAddCollectionMutation();  

    const [searchTerm, setSearchTerm] = useState<string>(''); 
    const handleInputChange = (value:string) => {
        setSearchTerm(value); 
    }

    const handleFormSubmit = async (data: {userId: string, name: string, file: FileList | undefined }) => {
        try {
            let downloadUrl = ''; 
            if(data.file && data.file.length > 0) {
                const file = data.file[0] as File; 
                const storageRef = ref(storage, `/images/${file.name}`); 
                const snapshot = await uploadBytes(storageRef, file); 
                downloadUrl = await getDownloadURL(snapshot.ref); 
            }
            const collection = {
                userId: data.userId,
                name: data.name, 
                id: faker.string.uuid(), 
                imageUrl: downloadUrl
            }

            await addCollection(collection); 
            setModalOpen(false); 
            setIsSuccess(true); 
            setTimeout(() => setIsSuccess(false), 2000); 
        } catch (error) {
            // popraw
            console.error(error); 
        }
    }

    const handlePromptClose = () => setIsSuccess(false); 
    

    return (
        <div className="page-container">
            {
                isSuccess
                &&
                <Prompt handleClose={handlePromptClose} success>Collection successfully added</Prompt>
            }
            <div className="page-title">
                <button className="btn-add" onClick={() => setModalOpen(true)}>+Add collection</button>
                <div className="search">
                    <Input 
                        value={searchTerm}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
            <div className="page-section">
                <CollectionList 
                    data={data?.filter(collection => collection.name.includes(searchTerm))}
                    isLoading={isLoading}
                    isError={isError}                
                />
            </div>

                <CollectionModal 
                    handleFormSubmit={handleFormSubmit} 
                    userId={userId || ''} 
                    isAdding={isAdding} 
                    show={modalOpen}
                    handleClose={() => setModalOpen(false)}
                />
        </div>
    ); 
}