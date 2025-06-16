import { useState, useRef, type ChangeEvent } from 'react';
import type { FormData } from '../models/storage';


export default function useCreate() {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isTraitModalOpen, setTraitModalOpen] = useState<boolean>(false);

    const [data, setData] = useState<FormData>({
        name: "",
        description: "",
        external_url: "",
        attributes: []
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
        }
    };

    const handleRemoveTrait = (index: number) => {
        setData(prev => ({
            ...prev,
            attributes: prev.attributes.filter((_, i) => i !== index)
        }));
    };

    return {
        file, 
        isTraitModalOpen, setTraitModalOpen, 
        fileInputRef, 
        handleFileChange, 
        handleRemoveTrait, 
        data, setData,
        open, setOpen
    }
}