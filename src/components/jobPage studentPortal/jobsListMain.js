import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import './Jobsstyle.css';
import Title from '../title/title';
import { useDispatch, useSelector } from 'react-redux';
import Footer from '../footer/Footer';
import { useLocation, useParams } from 'react-router-dom';
import { fetchAllJobsUsers, fetchOneJob } from '../redux/reducers/JobSlice.';
import JobListHeader from './jobListHeader';
import AddApplication from './addApplication';
import Pagination from '../pagination/pagination';

function JobsListMain() {
	// ------------------------------ server ---------------------------
	const { pathname } = useLocation();
	const { jobId } = useParams();
	const dispatch = useDispatch();
	const {
		all: jobs,
		job,
		loading,
		locations, //get locations exist in database documents for filter
		pagination,
	} = useSelector((state) => state.jobs);

	const [searchInput, setSearchInput] = useState('');
	const [filter, setFilter] = useState({});
	const [changePage, setChangePage] = useState(1);

	const handlePageChange = (page) => {
		setChangePage(page);
		// setSearchParams({ searchValue: search, page });
	};

	useEffect(() => {
		if (jobId) {
			// dispatch(fetchAllJobs());
			dispatch(fetchOneJob(jobId));
		}
	}, [jobId, dispatch]);

	const salaryRangeArray = [
		{ 'salary.to': { $lte: 4000 } },
		{
			salary: [
				{
					$elemMatch: {
						from: { $gte: 4000 },
						to: { $lte: 10000 },
					},
				},
			],
		},
		{ 'salary.to': { $gte: 10000 } },
	];

	const [location, setLocation] = useState('');
	const [jobType, setJobType] = useState([]);
	const [jobLevel, setjobLevel] = useState([]);
	const [salaryRangeIndexes, setSalaryRangeIndexes] = useState([]);
	const [salaryRange, setSalaryRange] = useState([]);

	var [menu, setMenu] = useState(false);
	var selectRef = useRef(null);

	const handelCheckSalary = (e) => {
		let updatedIndexes = [...salaryRangeIndexes];

		if (e.target.checked) {
			updatedIndexes.push(e?.target?.value);
		} else {
			updatedIndexes = updatedIndexes.filter((item) => item !== e?.target?.value);
		}

		setSalaryRange(updatedIndexes.map((index) => salaryRangeArray[index]));
		setSalaryRangeIndexes(updatedIndexes);
	};

	useEffect(() => {
		setFilter({ jobType, $or: [...salaryRange] });

		if (location) {
			setFilter({ location, jobType, $or: [...salaryRange] });
		}
		if (searchInput) {
			setFilter({
				jobType,
				// jobLevel,
				$or: [...salaryRange],
				$text: { $search: searchInput },
			});
		}
		if (location && searchInput) {
			setFilter({
				location,
				jobType,
				// jobLevel,
				$or: [...salaryRange],
				$text: { $search: searchInput },
			});
		}
		setChangePage(1);
	}, [dispatch, location, jobType, jobLevel, salaryRange, searchInput]);

	useEffect(() => {
		dispatch(fetchAllJobsUsers({ filter, page: changePage }));
	}, [dispatch, filter, changePage]);
	// ------------------------------ server ---------------------------

	var handleClear = () => {
		const checkboxes = document.querySelectorAll('input[type=checkbox]:checked');
		checkboxes.forEach((checkbox) => (checkbox.checked = false));
		setLocation('');
		setJobType('');
		setjobLevel('');
		setSalaryRange({ $or: [] });
		selectRef.current.value = '';
	};

	return (
		<>
			<meta
				name="viewport"
				content="width=device-width, initial-scale=1.0, maximum-scale=1, minimum-scale=1"
			/>
			<div className="body">
				<div className="position-relative">
					<div class="container">
						<div class="date  mt-5 mb-4">
							<div class="info-header">
								<Title title={'Find Job'} />
							</div>
						</div>
					</div>
					<div class="d-flex container mb-5 justify-content-between head">
						<div class="jobLooking col-12">
							<h1>Looking for a job ?</h1>
							<p>
								Here you can find your best match between 1000s of updated and
								available positions
							</p>
						</div>
						{/* search input ------------------------------- */}
						<div class="searchBox justify-content-end">
							<span className="position-relative">
								<FontAwesomeIcon
									className="icon position-absolute"
									icon={faMagnifyingGlass}
								/>
								<input
									placeholder="Search for a job"
									onChange={(e) => {
										// setSearch(e.target.value);
										// setClicked(false);
										setSearchInput(e.target.value);
									}}
								></input>
								<button
									type="button"
									// onClick={() => setClicked(true)}
								>
									SEARCH
								</button>
								<button type="button" id="menu" onClick={() => setMenu(!menu)}>
									<FontAwesomeIcon icon={faFilter} />
								</button>
							</span>
						</div>
					</div>

					<div class="container filter-side d-flex bd-highlight p-0">
						<div className={menu ? 'filter' : 'filter display-none'}>
							{/* sidebar filter ----------------------------------------- */}
							<aside class="job-filter pb-5">
								<div class="filter-head d-flex  p-2 align-items-baseline rounded">
									<h2 class="text-white mr-5 fs-5">Filters</h2>
									<button
										id="clear-filter"
										class="btn filter-btn"
										onClick={handleClear}
									>
										Clear All
									</button>
								</div>
								<div class="p-4">
									<div class="filter-item">
										<label for="location" class="text-white">
											Location:
										</label>
										<select
											id="location"
											class="form-select text-light border-0"
											ref={selectRef}
											onChange={(e) => setLocation(e.target.value)}
										>
											<option value="">All</option>
											{locations.map((location, index) => (
												<option key={index} value={location}>
													{location}
												</option>
											))}
											{/* <option value="New York">New York</option>
											<option value="San Francisco">San Francisco</option> */}
										</select>
									</div>
									<div class="filter-item">
										<label class="text-white">Job Type:</label>
										{/* <div class="form-check">
											<input
												type="checkbox"
												id="full-time"
												class="form-check-input"
												name="jobType"
												value="Full-time"
												onChange={(e) => {
													e.target.checked
														? setJobType([...jobType, e.target.value])
														: setJobType(
																jobType.filter(
																	(item) => item !== e.target.value
																)
														);
												}}
											/>
											<label
												for="full-time"
												class="form-check-label text-white"
											>
												Full-time
											</label>
										</div> */}
										<div class="form-check">
											<input
												type="checkbox"
												id="part-time"
												class="form-check-input"
												name="jobType"
												// value="Part-time"
												value="onSite"
												onChange={(e) => {
													e.target.checked
														? setJobType([...jobType, e.target.value])
														: setJobType(
																jobType.filter(
																	(item) => item !== e.target.value
																)
														  );
												}}
											/>
											<label
												for="part-time"
												class="form-check-label text-white"
											>
												OnSite
											</label>
										</div>
										<div class="form-check">
											<input
												type="checkbox"
												id="remote"
												class="form-check-input"
												name="jobType"
												value="remote"
												onChange={(e) => {
													e.target.checked
														? setJobType([...jobType, e.target.value])
														: setJobType(
																jobType.filter(
																	(item) => item !== e.target.value
																)
														  );
												}}
											/>
											<label for="remote" class="form-check-label text-white">
												Remote
											</label>
										</div>
									</div>
									<div class="filter-item">
										<label class="text-white">Job Level:</label>
										<div class="form-check">
											<input
												type="checkbox"
												id="entry-level"
												class="form-check-input"
												name="jobLevel"
												value="1"
												onChange={(e) => {
													e.target.checked
														? setjobLevel([...jobLevel, e.target.value])
														: setjobLevel(
																jobLevel.filter(
																	(item) => item !== e.target.value
																)
														  );
												}}
											/>
											<label
												for="entry-level"
												class="form-check-label text-white"
											>
												Entry Level
											</label>
										</div>
										<div class="form-check">
											<input
												type="checkbox"
												id="intermediate"
												class="form-check-input"
												name="jobLevel"
												value="2"
												onChange={(e) => {
													e.target.checked
														? setjobLevel([...jobLevel, e.target.value])
														: setjobLevel(
																jobLevel.filter(
																	(item) => item !== e.target.value
																)
														  );
												}}
											/>
											<label
												for="intermediate"
												class="form-check-label text-white"
											>
												Intermediate
											</label>
										</div>
										<div class="form-check">
											<input
												type="checkbox"
												id="expert"
												class="form-check-input"
												name="jobLevel"
												value="3"
												onChange={(e) => {
													e.target.checked
														? setjobLevel([...jobLevel, e.target.value])
														: setjobLevel(
																jobLevel.filter(
																	(item) => item !== e.target.value
																)
														  );
												}}
											/>
											<label class="form-check-label text-white">Expert</label>
										</div>
									</div>
									<div class="filter-item">
										<label class="text-white">Salary Range:</label>
										<div class="form-check">
											<input
												type="checkbox"
												id="salary-1"
												class="form-check-input"
												name="salaryRange"
												value={0}
												onChange={handelCheckSalary}
											/>
											<label
												for="salary-1"
												class="form-check-label text-white"
											>
												Less than $4000
											</label>
										</div>
										<div class="form-check">
											<input
												type="checkbox"
												id="salary-2"
												class="form-check-input"
												name="salaryRange"
												// value="4000-10000"
												value={1}
												onChange={handelCheckSalary}
											/>
											<label
												for="salary-2"
												class="form-check-label text-white"
											>
												$4000 - $10000
											</label>
										</div>
										<div class="form-check">
											<input
												type="checkbox"
												id="salary-3"
												class="form-check-input"
												name="salaryRange"
												// value="10000"
												value={2}
												onChange={handelCheckSalary}
											/>
											<label
												for="salary-3"
												class="form-check-label text-white"
											>
												More than $10000
											</label>
										</div>
									</div>
								</div>
							</aside>
							<div class="mt-4">
								<button class="btn cv-btn text-light">CREATE YOUR CV</button>
							</div>
						</div>

						<div class="pl-3 flex-grow-1">
							{/* <Outlet context={[jobData]} /> */}
							{pathname === '/jobs' ? (
								jobs?.length < 1 ? (
									<h6 className="text-light text-center">
										There is no data to display
									</h6>
								) : (
									jobs?.map((job) => <JobListHeader key={job?._id} job={job} />)
								)
							) : pathname?.includes('/add-application') ? (
								<AddApplication />
							) : (
								<JobListHeader type="details" job={job} />
							)}
						</div>
					</div>
					{pathname === '/jobs' && (
						<Pagination
							total={pagination?.total}
							pages={pagination?.pages}
							currentPage={pagination?.page}
							limit={pagination?.limit}
							onPageChange={handlePageChange}
						/>
					)}
				</div>
			</div>
			<Footer />
		</>
	);
}
export default JobsListMain;