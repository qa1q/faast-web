import React, { Fragment } from 'react'
import { createStructuredSelector } from 'reselect'
import { Row, Col, Card, CardHeader, CardBody, CardDeck, CardFooter } from 'reactstrap'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { toBigNumber } from 'Utilities/numbers'
import { compose, setDisplayName, lifecycle } from 'recompose'
import QRCode from 'Components/DepositQRCode'
import ClipboardCopyField from 'Components/ClipboardCopyField'
import MakerLayout from 'Components/Maker/Layout'
import SwapsTable from 'Components/Maker/SwapsTable'
import BalancesTable from 'Components/Maker/BalanceTable'
// import StatsChart from './statsChart'
import Units from 'Components/Units'
import Loading from 'Components/Loading'
import { getStats } from 'Actions/maker'
import Link from 'Components/Link'
import classNames from 'class-names'

import { makerId, getMakerProfile, getMakerProfitUSD, getMakerProfitBTC, getMakerSecret,
  getTotalBalanceBTC } from 'Selectors/maker'

import { statContainer, row, statCol } from './style'
import { card, cardHeader, text, smallCard, input } from '../style'


const MakerDashboard = ({ totalBalanceBTC = '-', profile, profile: { capacityAddress, approxTotalBalances: { total: { USD: balanceUSD = '0' } = {} } = {}, 
  swapsCompleted = '-', capacityMaximumBtc = '-', isRegistrationComplete }, makerProfitUSD, makerProfitBTC }) => {
  const CapacityWalletRow = () => (
    <Card className={classNames(card, smallCard)}>
      <CardHeader className={cardHeader}>Capacity Wallet</CardHeader>
      <CardBody className={`text-center ${profile && !capacityAddress ? 'd-flex justify-content-center' : ''}`}>
        {profile && capacityAddress ? (
          <Fragment>
            <QRCode address={capacityAddress} size={150} />
            <p className={text}>
              <span>[Current Balance: </span>{capacityMaximumBtc} BTC]
            </p>
            <p style={{ fontWeight: 600 }} className={classNames('text-left mb-0', text)}>Capacity Address:</p>
            <ClipboardCopyField className={input} value={capacityAddress} />
            <small className={classNames('text-left d-block', text)}>Depositing more BTC to your capacity address will increase the swap value your maker can process.</small>
          </Fragment>
        ) : profile && !capacityAddress ? (
          <div className='d-flex align-items-center justify-content-center'>
            <p className={text}>Your capacity wallet details are not available at this time.</p>
          </div>
        ) : (
          <Loading />
        )}
      </CardBody>
    </Card>
  )

  return (
    <Fragment>
      <MakerLayout className='pt-3'>
        <Fragment>
          {profile && !isRegistrationComplete ? (
            <Fragment>
              <Row className='mt-4'>
                <CardDeck style={{ flex: 1 }}>
                  <Card className={classNames(card, smallCard)}>
                    <CardHeader className={cardHeader}>Setup Maker</CardHeader>
                    <CardBody>
                      <p className={text}>
                        Before you can start earning rewards by fulfilling swaps, you need to set up your maker bot on a dedicated server, set up your exchange API accounts, and fund your maker.
                      </p>
                      <ol className={classNames(text, 'pl-4')}>
                        <li>
                          <a href='/app/makers/setup/server' target='_blank'>Maker Bot Setup</a>
                        </li>
                        <li>
                          <a href='/app/makers/setup/exchanges' target='_blank'>Binance API Setup</a>
                        </li>
                        <li>
                          <Link to={'/makers/dashboard/capacity'}>Send BTC to your capacity address</Link>
                        </li>
                        <li>
                          <a href='/app/makers/balances' target='_blank'>Send at least the minimum amount to your maker wallet for each of your supported assets</a>
                        </li>
                      </ol>
                    </CardBody>
                    <CardFooter className={classNames(text, cardHeader, 'mb-0')}>
                      Have questions? <b>Contact us: support@faa.st</b>
                    </CardFooter>
                  </Card>
                  <CapacityWalletRow /> 
                </CardDeck>
              </Row>
            </Fragment>
          ) : (
            <Fragment>
              <Row>
                <Col>
                  
                </Col>
              </Row>
              <Row className={classNames(row, statContainer, 'text-center mt-3')}>
                <Col className={classNames('mt-xs-3 mt-md-0 mt-0', statCol)} sm='12' md='4'>
                  <div className={classNames('mx-auto')}>
                    <p className='text-center mb-0'>Total Balance (USD)</p>
                    <p className='pt-0 mb-0'>${balanceUSD}</p>
                  </div>
                </Col>
                <Col className={classNames('mt-0', statCol)} sm='12' md='4'>
                  <div className={classNames('mx-auto')}>
                    <p className='text-center mb-0'>Total Balance (BTC)</p>
                    <p className='pt-0 mb-0'>{totalBalanceBTC}</p>
                  </div>
                </Col>
                <Col className={classNames('mt-xs-3 mt-md-0 mt-0', statCol)} sm='12' md='4'>
                  <div className={classNames('mx-auto')}>
                    <p className='text-center mb-0'>Swaps Completed</p>
                    <p className='pt-0 mb-0'>{swapsCompleted}</p>
                  </div>
                </Col>
              </Row>
              <Row className='mt-4'>
                <CardDeck style={{ flex: 1 }}>
                  <SwapsTable title={'Recent Swaps'} size='small'/>
                  <Card className={classNames(card, smallCard)}>
                    <CardHeader className={cardHeader}>Rewards to Date</CardHeader>
                    <CardBody className='text-center'>
                      {!isNaN(makerProfitUSD) && makerProfitUSD > 0 ? (
                        <Fragment>
                          <p className='my-3' style={{ fontSize: 70 }}>🎉</p>
                          <span style={{ fontSize: 50 }} className={text}>
                            {makerProfitUSD > 0 && '+'}<Units value={toBigNumber(makerProfitUSD)} symbol='$' currency prefixSymbol symbolSpaced={false} precision={6} className={classNames('font-weight-bold mt-0 mb-2 d-inline-block', text)} />
                          </span>
                          {makerProfitBTC ? (
                            <div>
                              <span style={{ fontSize: 20 }} className={text}>
                                {makerProfitBTC > 0 && '+'}<Units value={makerProfitBTC} symbol='BTC' precision={6} className={classNames('mt-0 mb-2 d-inline-block', text)} />
                              </span>
                            </div>
                          ) : null}
                        </Fragment>
                      ) : (
                        <Fragment>
                          <p className='mt-0 mb-0' style={{ fontSize: 70 }}>☕️</p>
                          <p style={{ fontSize: 20 }} className={classNames(text, 'mb-3')}>No rewards just yet.</p>
                        </Fragment>
                      )}
                    </CardBody>
                  </Card>
                </CardDeck>
              </Row>
              <Row className='mt-4'>
                <CardDeck style={{ flex: 1 }}>
                  <BalancesTable size='small' />
                  <CapacityWalletRow />
                </CardDeck>
              </Row>
            </Fragment>
          )}
        </Fragment>
      </MakerLayout>
    </Fragment>
  )
}

export default compose(
  setDisplayName('MakerDashboard'),
  connect(createStructuredSelector({
    profile: getMakerProfile,
    makerId,
    makerProfitUSD: getMakerProfitUSD,
    makerProfitBTC: getMakerProfitBTC,
    makerSecret: getMakerSecret,
    totalBalanceBTC: getTotalBalanceBTC
  }), {
    getStats,
    push: push,
  }),
  lifecycle({
    componentDidMount() {
      const { makerSecret } = this.props
      if (makerSecret) {
        push('/makers/dashboard/account')
      }
    }
  }),
)(MakerDashboard)
