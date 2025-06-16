import { useContext } from 'react';
import { Web3Context } from "../providers/W3Provider";

export default function useW3Context() {
    const context = useContext(Web3Context);
    return context;
}