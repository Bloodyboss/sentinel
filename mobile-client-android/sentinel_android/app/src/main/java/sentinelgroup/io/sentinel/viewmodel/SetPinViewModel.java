package sentinelgroup.io.sentinel.viewmodel;

import android.arch.lifecycle.ViewModel;

import sentinelgroup.io.sentinel.db.PinEntity;
import sentinelgroup.io.sentinel.repository.PinRepository;
import sentinelgroup.io.sentinel.util.SingleLiveEvent;

public class SetPinViewModel extends ViewModel {
    private final PinRepository mRepository;
    private final SingleLiveEvent<Boolean> mIsPinSetLiveEvent;

    SetPinViewModel(PinRepository iRepository) {
        mRepository = iRepository;
        mIsPinSetLiveEvent = iRepository.getIsPinSetLiveEvent();
    }

    public SingleLiveEvent<Boolean> getIsPinSetLiveEvent() {
        return mIsPinSetLiveEvent;
    }

    public void setAppPin(int iPin, String iAccountAddress) {
        PinEntity iEntity = new PinEntity(iAccountAddress, iPin);
        mRepository.setAppPin(iEntity);
    }
}