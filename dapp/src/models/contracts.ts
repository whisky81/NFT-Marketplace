import type { ApprovalEvent, ApprovalForAllEvent, TransferEvent, Whisky } from "../abis/Whisky";

class ContractEvents {
    static async getTransferEvent(contract: Whisky): Promise<TransferEvent.OutputObject[]> {
        try {
            let targetEvent = contract.filters.Transfer(); 
            const eventLogs = await contract.queryFilter(targetEvent, 0, "latest");
            const events: TransferEvent.OutputObject[] = [];

            for (const el of eventLogs) {
                events.push(el.args);
            }
            return events;
        } catch(e) {
            throw e;
        }
    }
    static async getApprovalEvent(contract: Whisky): Promise<ApprovalEvent.OutputObject[]> {
        try {
            let targetEvent = contract.filters.Approval();
            
            const eventLogs = await contract.queryFilter(targetEvent, 0, "latest");
            const events: ApprovalEvent.OutputObject[] = [];

            for (const el of eventLogs) {
                events.push(el.args);
            }
            return events;
        } catch(e) {
            throw e;
        }
    }

    static async getApprovalForAllEvent(contract: Whisky): Promise<ApprovalForAllEvent.OutputObject[]> {
        try {
            let targetEvent = contract.filters.ApprovalForAll();
            const eventLogs = await contract.queryFilter(targetEvent, 0, "latest");
            const events: ApprovalForAllEvent.OutputObject[] = [];

            for (const el of eventLogs) {
                events.push(el.args);
            }
            return events;
        } catch(e) {
            throw e;
        }
    }
}

export default ContractEvents;