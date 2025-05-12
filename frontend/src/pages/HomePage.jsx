import { ChatContainer } from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import Sidebar from "../components/Sidebar";
import { useChatStore } from "../store/useChatStore";

const HomePage = () => {
    const { selectedUser } = useChatStore();
    
    return (
        <div className="h-screen bg-base-200 flex flex-col">
            <div className="h-[65px]"></div>
            <div className="flex-1 w-full overflow-hidden">
                <div className="h-full w-full bg-base-100">
                    <div className="flex h-full">
                        <Sidebar />
                        {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;