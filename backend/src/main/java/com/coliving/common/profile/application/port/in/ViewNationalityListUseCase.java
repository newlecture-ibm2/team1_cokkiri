package com.coliving.common.profile.application.port.in;

import com.coliving.common.profile.application.result.NationalityListResult;
import java.util.List;

public interface ViewNationalityListUseCase {
    List<NationalityListResult> execute();
}
