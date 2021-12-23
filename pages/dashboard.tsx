import { useWeb3 } from '@3rdweb/hooks';
import { ThirdwebSDK } from '@3rdweb/sdk';
import { ethers } from 'ethers';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { IoSkullOutline } from 'react-icons/io5';

const sdk = new ThirdwebSDK('rinkeby');
const bundleDropModule = sdk.getBundleDropModule(
  process.env.NEXT_PUBLIC_BUNDLE_DROP_ADDRESS,
);

const tokenModule = sdk.getTokenModule(
  process.env.NEXT_PUBLIC_TOKEN_MODULE_ADDRESS,
);

const voteModule = sdk.getVoteModule(
  process.env.NEXT_PUBLIC_VOTE_MODULE_ADDRESS,
);

const Dashboard: NextPage = () => {
  const { address, error, provider } = useWeb3();

  const signer = provider ? provider.getSigner() : undefined;

  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  const [memberAddresses, setMemberAddresses] = useState([]);

  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    voteModule
      .getAll()
      .then((proposals) => {
        setProposals(proposals);
        console.log('Proposals:', proposals);
      })
      .catch((err) => {
        console.error('Failed to get proposals', err);
      });
  });

  useEffect(() => {
    if (!proposals.length) {
      return;
    }

    voteModule
      .hasVoted(proposals[0].proposalId, address)
      .then((hasVoted) => {
        setHasVoted(hasVoted);
        console.log('User has already voted');
      })
      .catch((err) => {
        console.error('Failed to check if wallet has voted', err);
      });
  }, [proposals, address]);

  const shortenAddress = (str) => {
    return str.substring(0, 6) + '...' + str.substring(str.length - 4);
  };

  useEffect(() => {
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
    if (!address) {
      // Redirect
      return;
    }

    bundleDropModule
      .balanceOf(address, '0')
      .then((balance) => {
        if (!balance.gt(0)) {
          //Redirect;
        }
      })
      .catch((err) => {
        // Redirect
        console.error('failed to find nft balance', err);
      });
  }, [address]);

  useEffect(() => {
    bundleDropModule
      .getAllClaimerAddresses('0')
      .then((addresess) => {
        console.log('🚀 Members addresses', addresess);
        setMemberAddresses(addresess);
      })
      .catch((err) => {
        console.error('failed to get member list', err);
      });
  }, []);

  useEffect(() => {
    // Grab all the balances.
    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log('👜 Amounts', amounts);
        setMemberTokenAmounts(amounts);
      })
      .catch((err) => {
        console.error('failed to get token amounts', err);
      });
  }, []);

  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          memberTokenAmounts[address] || 0,
          18,
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  return (
    <div className="bg-black min-h-screen px-8">
      <Head>
        <title>SkullDao</title>
        <meta name="description" content="SkullDao" />
      </Head>
      <div className="grid grid-cols-2 gap-8 place-content-center min-h-screen overflow-hidden">
        <div className="col-span-2 text-center">
          <h1 className="text-5xl inline-flex">
            SkullDAO Members
            <IoSkullOutline className="ml-5" />
          </h1>
        </div>

        <div className="bg-purple-700 p-5 rounded-lg">
          <h2 className="text-xl mb-5 font-bold">Member List</h2>
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th className="px-3 bg-purple-800 rounded-l-lg text-left">
                  Address
                </th>
                <th className="px-3 bg-purple-800 rounded-r-lg text-left">
                  Token Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {memberList.map((member) => {
                return (
                  <tr key={member.address} className="mb-2">
                    <td className="p-3">{shortenAddress(member.address)}</td>
                    <td className="p-3">{member.tokenAmount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();

            //before we do async things, we want to disable the button to prevent double clicks
            setIsVoting(true);

            // lets get the votes from the form for the values
            const votes = proposals.map((proposal) => {
              let voteResult = {
                proposalId: proposal.proposalId,
                //abstain by default
                vote: 2,
              };
              proposal.votes.forEach((vote) => {
                const elem = document.getElementById(
                  proposal.proposalId + '-' + vote.type,
                );

                if (elem.checked) {
                  voteResult.vote = vote.type;
                  return;
                }
              });
              return voteResult;
            });

            // first we need to make sure the user delegates their token to vote
            try {
              //we'll check if the wallet still needs to delegate their tokens before they can vote
              const delegation = await tokenModule.getDelegationOf(address);
              // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
              if (delegation === ethers.constants.AddressZero) {
                //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                await tokenModule.delegateTo(address);
              }
              // then we need to vote on the proposals
              try {
                await Promise.all(
                  votes.map(async (vote) => {
                    // before voting we first need to check whether the proposal is open for voting
                    // we first need to get the latest state of the proposal
                    const proposal = await voteModule.get(vote.proposalId);
                    // then we check if the proposal is open for voting (state === 1 means it is open)
                    if (proposal.state === 1) {
                      // if it is open for voting, we'll vote on it
                      return voteModule.vote(vote.proposalId, vote.vote);
                    }
                    // if the proposal is not open for voting we just return nothing, letting us continue
                    return;
                  }),
                );
                try {
                  // if any of the propsals are ready to be executed we'll need to execute them
                  // a proposal is ready to be executed if it is in state 4
                  await Promise.all(
                    votes.map(async (vote) => {
                      // we'll first get the latest state of the proposal again, since we may have just voted before
                      const proposal = await voteModule.get(vote.proposalId);

                      //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                      if (proposal.state === 4) {
                        return voteModule.execute(vote.proposalId);
                      }
                    }),
                  );
                  // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                  setHasVoted(true);
                  // and log out a success message
                  console.log('successfully voted');
                } catch (err) {
                  console.error('failed to execute votes', err);
                }
              } catch (err) {
                console.error('failed to vote', err);
              }
            } catch (err) {
              console.error('failed to delegate tokens');
            } finally {
              // in *either* case we need to set the isVoting state to false to enable the button again
              setIsVoting(false);
            }
          }}
        >
          {proposals.map((proposal, index) => (
            <div
              key={proposal.proposalId}
              className="bg-purple-700 p-5 rounded-lg mb-5"
            >
              <h2 className="text-xl mb-5 font-bold">{`Proposal ${
                index + 1
              }`}</h2>
              <div>
                <p className="px-3 bg-purple-800 rounded-lg text-left font-bold mb-2">
                  {proposal.description}
                </p>
                <div className="flex justify-between mb-2">
                  {proposal.votes.map((vote) => (
                    <div key={vote.type}>
                      <input
                        type="radio"
                        id={proposal.proposalId + '-' + vote.type}
                        name={proposal.proposalId}
                        value={vote.type}
                        //default the "abstain" vote to chedked
                        defaultChecked={vote.type === 2}
                        className=" appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-slate-500 checked:border-black"
                      />
                      <label
                        htmlFor={proposal.proposalId + '-' + vote.type}
                        className="ml-2"
                      >
                        {vote.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div className="items-center">
            <button
              disabled={isVoting || hasVoted}
              type="submit"
              className="button"
            >
              {isVoting
                ? 'Voting...'
                : hasVoted
                ? 'You Already Voted'
                : 'Submit Votes'}
            </button>
            <small className="flex">
              This will trigger multiple transactions that you will need to
              sign.
            </small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
