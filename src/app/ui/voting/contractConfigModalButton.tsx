'use client';

import { Modal } from 'antd';
import clsx from 'clsx';
import { useState } from 'react';
import { GovernanceConfig } from '@/lib/governance';
import { formatPercentageCompact, natToPercent } from '@/lib/governance/utils';
import { LinkPure, appTheme } from '@/app/ui/common';
import { Contract } from '@/lib/config';

interface ContractConfigProps {
  buttonText: string;
  config: GovernanceConfig;
  contract: Contract;
  contractUrl: string;
}

export const ContractConfigModalButton = ({ buttonText, contract, contractUrl, config }: ContractConfigProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const cellClassName = `sm:table-cell sm:border-b ${appTheme.borderColor} sm:p-2`;
  const captionClassName = `${appTheme.disabledTextColor}`;
  const valueCellClassName = 'sm:text-right';
  const rowClassName = `sm:table-row border-b sm:border-b-0 ${appTheme.borderColor} ${appTheme.componentBgHoverColor} pb-3 sm:pb-0`;

  return <>
    <button className={appTheme.textColorHover} onClick={showModal}>{buttonText}</button>
    <Modal
      title="Contract config"
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[]}
    >
      <div className="flex flex-col gap-3 sm:table w-full mt-4">
        <div className={rowClassName}>
          <div className={clsx(cellClassName, captionClassName)}>Contract type</div>
          <div className={clsx(cellClassName, valueCellClassName)}><span className="capitalize">{contract.name}</span></div>
        </div>
        <div className={rowClassName}>
          <div className={clsx(cellClassName, captionClassName)}>Contract address</div>
          <div className={clsx(cellClassName, valueCellClassName)}><LinkPure className={`${appTheme.textColor} ${appTheme.accentTextColorHover} underline hover:underline`} href={contractUrl} target="_blank">{contract.address}</LinkPure></div>
        </div>
        <div className={rowClassName}>
          <div className={clsx(cellClassName, captionClassName)}>Started at level</div>
          <div className={clsx(cellClassName, valueCellClassName)}>{config.startedAtLevel.toString()}</div>
        </div>
        <div className={rowClassName}>
          <div className={clsx(cellClassName, captionClassName)}>Period length</div>
          <div className={clsx(cellClassName, valueCellClassName)}>{config.periodLength.toString()} blocks</div>
        </div>
        <div className={rowClassName}>
          <div className={clsx(cellClassName, captionClassName)}>Adoption period</div>
          <div className={clsx(cellClassName, valueCellClassName)}>{config.adoptionPeriodSec.toString()} seconds</div>
        </div>
        <div className={rowClassName}>
          <div className={clsx(cellClassName, captionClassName)}>Upvoting limit</div>
          <div className={clsx(cellClassName, valueCellClassName)}>{config.upvotingLimit.toString()}</div>
        </div>
        <div className={rowClassName}>
          <div className={clsx(cellClassName, captionClassName)}>Proposal quorum</div>
          <div className={clsx(cellClassName, valueCellClassName)}>{formatPercentageCompact(natToPercent(config.proposalQuorum, config.scale))}</div>
        </div>
        <div className={rowClassName}>
          <div className={clsx(cellClassName, captionClassName)}>Promotion quorum</div>
          <div className={clsx(cellClassName, valueCellClassName)}>{formatPercentageCompact(natToPercent(config.promotionQuorum, config.scale))}</div>
        </div>
        <div className={rowClassName}>
          <div className={clsx(cellClassName, captionClassName)}>Promotion supermajority</div>
          <div className={clsx(cellClassName, valueCellClassName)}>{formatPercentageCompact(natToPercent(config.promotionSupermajority, config.scale))}</div>
        </div>
      </div>
    </Modal>
  </>
} 