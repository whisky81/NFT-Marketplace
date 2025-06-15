import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const WhiskyModule = buildModule("WhiskyModule", (m) => {
    const whisky = m.contract("Whisky", []);

    return { whisky };
});

export default WhiskyModule;