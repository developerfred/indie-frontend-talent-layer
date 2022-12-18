import useUsers from '../hooks/useUsers';
import MessageCard from '../components/MessageCard';
import ConversationCard from '../components/ConversationCard';
import { useContext, useState } from 'react';
import { XmtpContext } from '../context/XmtpContext';
import SubmitButton from '../components/Form/SubmitButton';
import TalentLayerContext from '../context/talentLayer';
import { useSigner } from 'wagmi';
import ConversationList from '../components/ConversationList';
import CardHeader from '../components/CardHeader';
import MessageList from '../components/MessageList';
import useStreamConversations from '../hooks/useStreamConversations';
import useSendMessage from '../hooks/useSendMessage';
import MessageComposer from '../components/MessageComposer';
import { useNavigate, useParams } from 'react-router-dom';

//TODO: Finalize UX
//TODO: Integrate "New message" + update when new conversation created
//TODO: Register user to XMTP when profile being created

function Messaging() {
  const { data: signer } = useSigner({ chainId: import.meta.env.VITE_NETWORK_ID });
  const { providerState } = useContext(XmtpContext);
  // const [selectedConversationPeerAddress, setSelectedConversationPeerAddress] =
  //   useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const { address: selectedConversationPeerAddress = '' } = useParams();
  const { sendMessage } = useSendMessage(
    selectedConversationPeerAddress ? selectedConversationPeerAddress : '',
    // user?.id ? user.id : '',
  );

  // Listens to new conversations ? ==> Yes, & sets them in "xmtp context". Stream stops "onDestroy"
  useStreamConversations();

  // if (!providerState) return;

  const handleXmtpConnect = async () => {
    if (providerState && providerState.initClient && signer) {
      // console.log('providerState.conversationMessages', providerState.conversationMessages);
      // console.log('providerState.conversations', providerState.conversations);
      //Conversations ===> Data sur les convers
      //conversationMessages ===> Messages Map address / Array Objets(messages)
      await providerState.initClient(signer);
    }
  };

  const sendNewMessage = () => {
    sendMessage(messageContent);
    setMessageContent('');
  };

  return (
    <div className='mx-auto text-gray-900 sm:px-4 lg:px-0'>
      <p className='text-5xl font-medium tracking-wider mb-8'>
        Indie <span className='text-indigo-600'>Chat </span>
      </p>

      {!providerState?.client && (
        <button
          type='submit'
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={() => handleXmtpConnect()}>
          Connect to XMTP
        </button>
      )}
      {providerState?.client && (
        // <div className='border-2 rounded-md'>
        <>
          <CardHeader peerAddress={selectedConversationPeerAddress} />
          <div className='flex flex-row'>
            <div className='basis-1/4 border-r-2'>
              <ConversationList
                conversationMessages={providerState.conversationMessages}
                // setSelectedConversationPeerAddress={setSelectedConversationPeerAddress}
              />
            </div>
            {providerState?.client && selectedConversationPeerAddress && (
              <div className='basis-3/4 w-full px-5 flex flex-col justify-between'>
                <MessageList
                  conversationMessages={
                    providerState.conversationMessages.get(selectedConversationPeerAddress) ?? []
                  }
                  selectedConversationPeerAddress={selectedConversationPeerAddress}
                />
                <MessageComposer
                  messageContent={messageContent}
                  setMessageContent={setMessageContent}
                  sendNewMessage={sendNewMessage}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Messaging;
